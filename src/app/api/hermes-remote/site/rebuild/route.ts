import { NextResponse } from 'next/server'
import {
  hermesRemoteDisabledResponse,
  unauthorizedHermesResponse,
  validateHermesRemoteSecret,
} from '@/lib/security/hermes-remote'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { secret?: string; hook?: string }

    if (!validateHermesRemoteSecret(body)) {
      return unauthorizedHermesResponse()
    }

    const hookUrl = body.hook || process.env.HERMES_REBUILD_HOOK
    if (!hookUrl) {
      return NextResponse.json(
        { error: 'No rebuild hook configured' },
        { status: 503 },
      )
    }

    const response = await fetch(hookUrl, { method: 'POST' })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json(
        { error: `Rebuild hook failed: ${response.status} ${text}` },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true, message: 'Rebuild triggered' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return hermesRemoteDisabledResponse()
}
