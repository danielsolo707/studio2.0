import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import {
  hermesRemoteDisabledResponse,
  unauthorizedHermesResponse,
  validateHermesRemoteSecret,
} from '@/lib/security/hermes-remote'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { secret?: string; commits?: number }

    if (!validateHermesRemoteSecret(body)) {
      return unauthorizedHermesResponse()
    }

    const steps = body.commits || 1
    if (steps < 1 || steps > 10) {
      return NextResponse.json({ error: 'commits must be between 1 and 10' }, { status: 400 })
    }

    const current = execSync('git rev-parse HEAD', { cwd: process.cwd() }).toString().trim()
    const target = execSync(`git rev-parse HEAD~${steps}`, { cwd: process.cwd() }).toString().trim()

    // Do a hard reset to the target commit. Hermes should confirm this is intentional.
    execSync(`git reset --hard ${target}`, { cwd: process.cwd() })

    return NextResponse.json({
      success: true,
      previous: current,
      target,
      message: `Rolled back ${steps} commit(s).`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return hermesRemoteDisabledResponse()
}
