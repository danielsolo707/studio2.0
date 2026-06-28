import { describe, expect, it } from 'vitest'
import { sanitizePublicHermesResponse } from '../sanitize'

describe('sanitizePublicHermesResponse', () => {
  it('returns safe fallback for empty input', () => {
    expect(sanitizePublicHermesResponse('')).toContain('not able to share')
  })

  it('redacts IP addresses', () => {
    const result = sanitizePublicHermesResponse('Server at 40.89.157.243:5050')
    expect(result).not.toContain('40.89.157.243')
    expect(result).not.toContain('5050')
    expect(result).toContain('[redacted]')
  })

  it('redacts the portfolio domain', () => {
    const result = sanitizePublicHermesResponse('Visit danielsoleimani.ir for more.')
    expect(result).not.toContain('danielsoleimani.ir')
    expect(result).toContain('[portfolio site]')
  })

  it('replaces the full legal name with first name only', () => {
    const result = sanitizePublicHermesResponse('Daniel Soleimani builds websites.')
    expect(result).not.toContain('Soleimani')
    expect(result).toBe('Daniel builds websites.')
  })

  it('redacts internal system and infrastructure names', () => {
    const result = sanitizePublicHermesResponse(
      'He runs Hermes Agent with a Telegram gateway, Portfolio API, FastAPI, and Hermes Remote on a VPS.',
    )
    expect(result).not.toContain('Hermes')
    expect(result).not.toContain('Telegram gateway')
    expect(result).not.toContain('Portfolio API')
    expect(result).not.toContain('FastAPI')
    expect(result).not.toContain('VPS')
  })

  it('redacts location references', () => {
    const result = sanitizePublicHermesResponse('Daniel is based in Iran.')
    expect(result).not.toContain('Iran')
    expect(result).toContain('[location]')
  })

  it('redacts email addresses', () => {
    const result = sanitizePublicHermesResponse('Email him at test@example.com.')
    expect(result).not.toContain('@example.com')
    expect(result).toContain('[email]')
  })

  it('keeps safe portfolio content intact', () => {
    const safe = 'Daniel is a creative developer who works with Next.js and Three.js.'
    expect(sanitizePublicHermesResponse(safe)).toBe(safe)
  })
})
