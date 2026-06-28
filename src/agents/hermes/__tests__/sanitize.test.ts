import { describe, expect, it } from 'vitest'
import { sanitizePublicHermesResponse } from '../sanitize'

describe('sanitizePublicHermesResponse', () => {
  it('returns safe fallback for empty input', () => {
    expect(sanitizePublicHermesResponse('')).toContain('not able to share')
  })

  it('returns the fallback when an IP address is mentioned', () => {
    const result = sanitizePublicHermesResponse('Server at 40.89.157.243:5050')
    expect(result).not.toContain('40.89.157.243')
    expect(result).toContain('not able to share')
  })

  it('returns the fallback when the portfolio domain is mentioned', () => {
    const result = sanitizePublicHermesResponse('Visit danielsoleimani.ir for more.')
    expect(result).not.toContain('danielsoleimani.ir')
    expect(result).toContain('not able to share')
  })

  it('replaces the full Latin name with first name only', () => {
    const result = sanitizePublicHermesResponse('Daniel Soleimani builds websites.')
    expect(result).not.toContain('Soleimani')
    expect(result).toBe('Daniel builds websites.')
  })

  it('replaces the full Persian name with first name only', () => {
    const result = sanitizePublicHermesResponse('دانیال سلیمانی یک توسعه‌دهنده است.')
    expect(result).not.toContain('سلیمانی')
    expect(result).toContain('دانیال')
    expect(result).toContain('توسعه‌دهنده')
  })

  it('returns the fallback when internal systems are mentioned', () => {
    const result = sanitizePublicHermesResponse(
      'He runs Hermes Agent with a Telegram gateway, Portfolio API, FastAPI, and Hermes Remote on a VPS.',
    )
    expect(result).not.toContain('Hermes')
    expect(result).not.toContain('Telegram')
    expect(result).not.toContain('FastAPI')
    expect(result).not.toContain('VPS')
    expect(result).toContain('not able to share')
  })

  it('returns the fallback when location is revealed', () => {
    const result = sanitizePublicHermesResponse('Daniel is based in Iran.')
    expect(result).not.toContain('Iran')
    expect(result).toContain('not able to share')
  })

  it('returns the fallback when an email address is mentioned', () => {
    const result = sanitizePublicHermesResponse('Email him at test@example.com.')
    expect(result).not.toContain('@example.com')
    expect(result).toContain('not able to share')
  })

  it('keeps safe portfolio content intact', () => {
    const safe = 'Daniel is a creative developer who works with Next.js and Three.js.'
    expect(sanitizePublicHermesResponse(safe)).toBe(safe)
  })

  it('keeps simple Persian greeting safe', () => {
    const greeting = 'سلام! چطوری؟'
    expect(sanitizePublicHermesResponse(greeting)).toBe(greeting)
  })

  it('returns the fallback for Persian infra leak', () => {
    const persianLeak = 'من از یک سیستم برای مدیریت سایت استفاده می‌کنم.'
    const result = sanitizePublicHermesResponse(persianLeak)
    expect(result).not.toContain('مدیریت')
    expect(result).not.toContain('سایت')
    expect(result).toContain('not able to share')
  })

  it('returns the fallback for full Persian name + infra combination', () => {
    const leak =
      'من دانیال سلیمانی هستم. سایت من در danielsoleimani.ir است و از Hermes استفاده می‌کنم.'
    const result = sanitizePublicHermesResponse(leak)
    expect(result).not.toContain('سلیمانی')
    expect(result).not.toContain('danielsoleimani')
    expect(result).not.toContain('Hermes')
    expect(result).toContain('not able to share')
  })
})
