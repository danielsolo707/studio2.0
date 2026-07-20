import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearRateLimitsForTests,
  consumeRateLimit,
  getClientIp,
  resetRateLimit,
} from '@/lib/security/rate-limit';

describe('rate limiter', () => {
  beforeEach(() => clearRateLimitsForTests());

  it('blocks requests after the configured limit', () => {
    expect(consumeRateLimit('chat:one', 2, 10_000, 1_000).allowed).toBe(true);
    expect(consumeRateLimit('chat:one', 2, 10_000, 1_001).allowed).toBe(true);
    const blocked = consumeRateLimit('chat:one', 2, 10_000, 1_002);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(10);
  });

  it('resets expired and explicitly cleared buckets', () => {
    consumeRateLimit('login:one', 1, 100, 1_000);
    expect(consumeRateLimit('login:one', 1, 100, 1_101).allowed).toBe(true);
    resetRateLimit('login:one');
    expect(consumeRateLimit('login:one', 1, 100, 1_102).allowed).toBe(true);
  });

  it('prefers a trusted proxy address header and bounds its length', () => {
    const values = new Map([
      ['cf-connecting-ip', '203.0.113.10'],
      ['x-forwarded-for', '198.51.100.1, 198.51.100.2'],
    ]);
    expect(getClientIp({ get: (name) => values.get(name) || null })).toBe('203.0.113.10');
  });
});
