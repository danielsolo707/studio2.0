import { afterEach, describe, expect, it } from 'vitest';
import {
  createSession,
  isSessionSecretConfigured,
  verifySession,
} from '@/lib/auth/session';

// @types/node marks NODE_ENV as readonly; tests still need to toggle it.
const env = process.env as NodeJS.ProcessEnv & { NODE_ENV?: string };

describe('admin session tokens', () => {
  const originalNodeEnv = env.NODE_ENV;
  const originalSecret = env.ADMIN_SESSION_SECRET;

  afterEach(() => {
    env.NODE_ENV = originalNodeEnv;
    if (originalSecret === undefined) {
      delete env.ADMIN_SESSION_SECRET;
    } else {
      env.ADMIN_SESSION_SECRET = originalSecret;
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
    const originalServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const originalPassword = env.ADMIN_PASSWORD;
    env.NODE_ENV = 'production';
    delete env.ADMIN_SESSION_SECRET;
    delete env.SUPABASE_SERVICE_ROLE_KEY;
    delete env.ADMIN_PASSWORD;
    expect(isSessionSecretConfigured()).toBe(false);

    env.ADMIN_SESSION_SECRET = 'dev-secret-change-me';
    expect(isSessionSecretConfigured()).toBe(false);

    env.ADMIN_SESSION_SECRET = 'a'.repeat(32);
    expect(isSessionSecretConfigured()).toBe(true);

    delete env.ADMIN_SESSION_SECRET;
    env.SUPABASE_SERVICE_ROLE_KEY = 's'.repeat(40);
    expect(isSessionSecretConfigured()).toBe(true);

    if (originalServiceKey === undefined) delete env.SUPABASE_SERVICE_ROLE_KEY;
    else env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
    if (originalPassword === undefined) delete env.ADMIN_PASSWORD;
    else env.ADMIN_PASSWORD = originalPassword;
  });
});
