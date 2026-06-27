import { NextResponse } from 'next/server'

export function getHermesRemoteSecret(): string {
  return process.env.HERMES_REMOTE_SECRET || ''
}

export function isHermesRemoteConfigured(): boolean {
  return Boolean(getHermesRemoteSecret())
}

export type HermesRemoteRequest = {
  secret: string
}

export function validateHermesRemoteSecret(body: Partial<HermesRemoteRequest>): boolean {
  const expected = getHermesRemoteSecret()
  if (!expected) return false
  return typeof body.secret === 'string' && body.secret === expected
}

export function unauthorizedHermesResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function hermesRemoteDisabledResponse() {
  return NextResponse.json(
    { error: 'Hermes remote integration is not configured' },
    { status: 503 },
  )
}
