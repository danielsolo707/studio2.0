import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth/session'
import { runHermesChat } from '@/agents/hermes/runtime/runHermes'
import { createChatSession, addChatMessage } from '@/lib/ai/ai-chat-db'
import type { HermesChatRequest, HermesChatResponse } from '@/agents/hermes/schemas/chat'
import type { HermesAction } from '@/agents/hermes/tools/types'
import { getCannedAnswer } from '@/lib/ai/canned-answers'

export const dynamic = 'force-dynamic'

const CHAT_COOKIE_NAME = 'chat_session_id'
const CHAT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

export type HermesChatApiResponse = HermesChatResponse & {
  actions?: HermesAction[]
  sessionId?: string
  fallback?: boolean
}

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null
  return request.headers.get('x-real-ip') || null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<HermesChatRequest>
    const mode = body.mode === 'admin' ? 'admin' : 'public'

    if (mode === 'admin') {
      const session = await getSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // ─── Session management ──────────────────────────────────────
    const cookieStore = await cookies()
    let sessionId = body.sessionId || null

    // For public chats: use cookie-based session, create if missing
    if (!sessionId && mode === 'public') {
      sessionId = cookieStore.get(CHAT_COOKIE_NAME)?.value || null
    }

    // For admin chats: always create a new session per conversation batch
    // if no sessionId was sent from the client
    if (!sessionId) {
      const ip = getClientIp(request)
      sessionId = await createChatSession(mode, { ip: ip || undefined })

      // Set cookie for public visitors so we can group their messages
      if (mode === 'public') {
        cookieStore.set(CHAT_COOKIE_NAME, sessionId, {
          httpOnly: true,
          maxAge: CHAT_COOKIE_MAX_AGE,
          path: '/',
          sameSite: 'lax',
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
    try {
      result = await runHermesChat(mode, userMessages)
    } catch (error) {
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
    const message = error instanceof Error ? error.message : 'Assistant request failed'
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
