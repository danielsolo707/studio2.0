import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { runHermesChat } from '@/agents/hermes/runtime/runHermes'
import type { HermesChatRequest, HermesChatResponse } from '@/agents/hermes/schemas/chat'
import type { HermesAction } from '@/agents/hermes/tools/types'

export const dynamic = 'force-dynamic'

export type HermesChatApiResponse = HermesChatResponse & {
  actions?: HermesAction[]
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

    const result = await runHermesChat(mode, Array.isArray(body.messages) ? body.messages : [])

    const response: HermesChatApiResponse = {
      configured: result.configured,
      model: result.model,
      message: {
        role: 'assistant',
        content: result.message,
      },
      actions: result.actions,
      error: result.error,
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
