import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SESSION_SECRET environment variable is required in production');
  }
  return secret || 'dev-secret-change-me';
}

export type SessionPayload = {
  user: string;
  exp: number;
};

export function createSession(user: string): string {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + DEFAULT_TTL_SECONDS,
  };
  const json = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', getSecret()).update(json).digest('hex');
  return Buffer.from(`${json}.${sig}`).toString('base64');
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [json, sig] = decoded.split('.');
    if (!json || !sig) return null;

    const expected = crypto.createHmac('sha256', getSecret()).update(json).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function setSession(user: string) {
  const token = createSession(user);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME);
}

/* ─── Half-auth token (2FA login flow) ───
 * Issued after the password check passes but before the second factor is
 * verified. It proves "step 1 succeeded" without granting access, so the
 * TOTP verification action can require it instead of trusting a bare POST.
 */
export type HalfAuthPayload = {
  user: string;
  exp: number;
};

const HALF_AUTH_TTL_SECONDS = 5 * 60; // 5 minutes

function signJson(json: string): string {
  return crypto.createHmac('sha256', getSecret()).update(json).digest('hex');
}

function parseSignedToken<T>(token: string | undefined): T | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [json, sig] = decoded.split('.');
    if (!json || !sig) return null;

    const expected = signJson(json);
    // Guard against timingSafeEqual throwing on mismatched lengths.
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function createHalfAuthToken(user: string): string {
  const payload: HalfAuthPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + HALF_AUTH_TTL_SECONDS,
  };
  const json = JSON.stringify(payload);
  const sig = signJson(json);
  return Buffer.from(`${json}.${sig}`).toString('base64');
}

export function verifyHalfAuthToken(token: string | undefined): HalfAuthPayload | null {
  const payload = parseSignedToken<HalfAuthPayload & { exp: number }>(token);
  if (!payload) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/* ─── Signed cookie helper (short-lived, tamper-proof) ─── */
async function setSignedCookie(name: string, value: string, maxAgeSeconds: number) {
  const json = JSON.stringify(value);
  const token = Buffer.from(`${json}.${signJson(json)}`).toString('base64');
  (await cookies()).set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

async function readSignedCookie(name: string): Promise<string | null> {
  const token = (await cookies()).get(name)?.value;
  const value = parseSignedToken<string>(token);
  return value;
}

async function deleteCookie(name: string) {
  (await cookies()).delete(name);
}

/* ─── Pending 2FA setup secret (kept off disk until verified) ─── */
const TOTP_PENDING_COOKIE = 'totp_pending';
const TOTP_PENDING_TTL_SECONDS = 5 * 60;

export async function setPendingTotpSecret(secret: string): Promise<void> {
  await setSignedCookie(TOTP_PENDING_COOKIE, secret, TOTP_PENDING_TTL_SECONDS);
}

export async function readPendingTotpSecret(): Promise<string | null> {
  return readSignedCookie(TOTP_PENDING_COOKIE);
}

export async function clearPendingTotpSecret(): Promise<void> {
  await deleteCookie(TOTP_PENDING_COOKIE);
}
