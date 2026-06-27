import { NextResponse } from 'next/server'
import { readContent } from '@/lib/cms/content'
import {
  hermesRemoteDisabledResponse,
  unauthorizedHermesResponse,
  validateHermesRemoteSecret,
} from '@/lib/security/hermes-remote'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { secret?: string }

    if (!validateHermesRemoteSecret(body)) {
      return unauthorizedHermesResponse()
    }

    const start = Date.now()
    const content = await readContent()
    const dbLatencyMs = Date.now() - start

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      projectCount: content.projects.length,
      dbLatencyMs,
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  return hermesRemoteDisabledResponse()
}
