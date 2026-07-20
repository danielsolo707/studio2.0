import { afterEach, describe, expect, it } from 'vitest';
import {
  createSession,
  isSessionSecretConfigured,
  verifySession,
} from '@/lib/auth/session';

describe('admin session tokens', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecret = process.env.ADMIN_SESSION_SECRET;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalSecret === undefined) {
      delete process.env.ADMIN_SESSION_SECRET;
    } else {
      process.env.ADMIN_SESSION_SECRET = originalSecret;
    }
  });

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

  it('reports production session secret misconfiguration', () => {
    const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const originalPassword = process.env.ADMIN_PASSWORD;
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.ADMIN_PASSWORD;
    expect(isSessionSecretConfigured()).toBe(false);

    process.env.ADMIN_SESSION_SECRET = 'dev-secret-change-me';
    expect(isSessionSecretConfigured()).toBe(false);

    process.env.ADMIN_SESSION_SECRET = 'a'.repeat(32);
    expect(isSessionSecretConfigured()).toBe(true);

    delete process.env.ADMIN_SESSION_SECRET;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 's'.repeat(40);
    expect(isSessionSecretConfigured()).toBe(true);

    if (originalServiceKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPassword;
  });
});
