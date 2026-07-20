import { describe, expect, it } from 'vitest';
import { createSession, verifySession } from '@/lib/auth/session';

describe('admin session tokens', () => {
  it('round-trips usernames containing periods', () => {
    const token = createSession('admin@example.test');
    expect(verifySession(token)?.user).toBe('admin@example.test');
  });

  it('rejects tampered and oversized tokens', () => {
    const token = createSession('admin');
    const tampered = `${token.slice(0, -1)}${token.endsWith('A') ? 'B' : 'A'}`;
    expect(verifySession(tampered)).toBeNull();
    expect(verifySession('a'.repeat(4097))).toBeNull();
  });
});
