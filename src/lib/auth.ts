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
  (await cookies()).set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
