import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getSession } from '@/lib/auth/session'
import { runHermesChat } from '@/agents/hermes/runtime/runHermes'
import { getHermesConfigSync } from '@/agents/hermes/config'
import { createChatSession, addChatMessage } from '@/lib/ai/ai-chat-db'
import type { HermesChatRequest, HermesChatResponse } from '@/agents/hermes/schemas/chat'
import type { HermesAction } from '@/agents/hermes/tools/types'
import { getCannedAnswer } from '@/lib/ai/canned-answers'
import { consumeRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { readLimitedJson, RequestBodyTooLargeError } from '@/lib/security/request-body'

export const dynamic = 'force-dynamic'

const CHAT_COOKIE_NAME = 'chat_session_id'
const CHAT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
const MAX_CHAT_BODY_BYTES = 32 * 1024
const sessionIdSchema = z.string().uuid()

const chatRequestSchema = z.object({
  mode: z.enum(['public', 'admin']).default('public'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(4000),
  })).min(1).max(6),
  sessionId: z.string().uuid().optional().nullable().transform((val) => val ?? undefined),
}).strict()

export type HermesChatApiResponse = HermesChatResponse & {
  actions?: HermesAction[]
  sessionId?: string
  fallback?: boolean
}

export async function POST(request: Request) {
  try {
    const rawBody = await readLimitedJson(request, MAX_CHAT_BODY_BYTES)
    const parsedBody = chatRequestSchema.safeParse(rawBody)
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid chat request' }, { status: 400 })
    }

    const body = parsedBody.data as HermesChatRequest
    const mode = body.mode
    const clientIp = getClientIp(request.headers)

    if (mode === 'public') {
      const rateLimit = consumeRateLimit(`public-chat:${clientIp}`, 20, 10 * 60 * 1000)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many assistant requests. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
        )
      }
    }

    if (mode === 'admin') {
      const session = await getSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // ─── Session management ──────────────────────────────────────
    const cookieStore = await cookies()
    // Public callers cannot select an arbitrary database session. Their
    // server-issued HttpOnly cookie is the only accepted conversation key.
    let sessionId = mode === 'admin' ? body.sessionId || null : null

    // For public chats: use cookie-based session, create if missing
    if (!sessionId && mode === 'public') {
      const cookieSessionId = cookieStore.get(CHAT_COOKIE_NAME)?.value
      sessionId = sessionIdSchema.safeParse(cookieSessionId).success ? cookieSessionId! : null
    }

    // For admin chats: always create a new session per conversation batch
    // if no sessionId was sent from the client
    if (!sessionId) {
      sessionId = await createChatSession(mode, {
        ip: clientIp === 'unknown' ? undefined : clientIp,
      })

      // Set cookie for public visitors so we can group their messages
      if (mode === 'public') {
        cookieStore.set(CHAT_COOKIE_NAME, sessionId, {
          httpOnly: true,
          maxAge: CHAT_COOKIE_MAX_AGE,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      }
    }

    // ─── Save user message ──────────────────────────────────────
    const userMessages = Array.isArray(body.messages) ? body.messages : []
    const lastUserMsg = userMessages.filter((m) => m.role === 'user').pop()
    if (lastUserMsg?.content && sessionId) {
      await addChatMessage(sessionId, 'user', String(lastUserMsg.content).slice(0, 4000))
    }

    // ─── Call AI ─────────────────────────────────────────────────
    let result
    let fallback = false

    // Debug: log the current env config state
    const syncConfig = getHermesConfigSync()
    console.log(`[hermes] mode=${mode} hasApiKey=${Boolean(syncConfig.apiKey)} model=${syncConfig.model} provider=${syncConfig.provider}`)

    try {
      result = await runHermesChat(mode, userMessages)
      console.log(`[hermes] result configured=${result.configured} fallback=${fallback} model=${result.model} msgLen=${result.message?.length}`)
    } catch (error) {
      console.error(`[assistant] ${mode} provider request failed`, error)
      if (mode === 'admin') {
        result = {
          configured: true,
          model: 'unavailable',
          message: 'The live AI provider did not respond in time. No dashboard action was created. Please retry in a moment; your existing dashboard tools remain available.',
        }
      } else {
        fallback = true
        const lastQuestion = String(lastUserMsg?.content || '')
        result = {
          configured: true,
          model: 'local-fallback',
          message: getCannedAnswer(lastQuestion),
        }
      }
    }

    if (mode === 'public' && !result.configured) {
      fallback = true
      result = { ...result, configured: true, model: 'local-fallback', message: getCannedAnswer(String(lastUserMsg?.content || '')) }
    }

    // ─── Save assistant message ─────────────────────────────────
    if (result.message && sessionId) {
      await addChatMessage(sessionId, 'assistant', result.message, result.model)
    }

    const response: HermesChatApiResponse = {
      configured: result.configured,
      model: result.model,
      message: {
        role: 'assistant',
        content: result.message,
      },
      actions: result.actions,
      error: result.error,
      sessionId: sessionId || undefined,
      fallback,
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: 'Chat request is too large' }, { status: 413 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 })
    }
    console.error('Assistant request failed', error)
    const message = 'Assistant request failed'
    return NextResponse.json(
      {
        configured: true,
        error: message,
        message: {
          role: 'assistant',
          content: `Assistant could not respond: ${message}`,
        },
      } satisfies HermesChatApiResponse,
      { status: 500 },
    )
  }
}
