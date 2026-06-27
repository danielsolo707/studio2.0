import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/integrations/telegram'
import {
  hermesRemoteDisabledResponse,
  unauthorizedHermesResponse,
  validateHermesRemoteSecret,
} from '@/lib/security/hermes-remote'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { secret?: string; text?: string; level?: 'info' | 'warning' | 'error' }

    if (!validateHermesRemoteSecret(body)) {
      return unauthorizedHermesResponse()
    }

    const text = body.text?.trim()
    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    const level = body.level || 'info'
    const prefixed = `[Hermes ${level.toUpperCase()}]\n${text}`

    const result = await sendTelegramMessage(prefixed)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return hermesRemoteDisabledResponse()
}
