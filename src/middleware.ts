import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_session';
const INSECURE_PRODUCTION_SECRETS = new Set([
  'dev-secret-change-me',
  'dev-secret-change-me-in-production',
  'change-me',
]);

function isExplicitSecretValid(secret: string | undefined): secret is string {
  return Boolean(secret && secret.length >= 32 && !INSECURE_PRODUCTION_SECRETS.has(secret));
}

/**
 * Keep in lockstep with `src/lib/auth/session.ts` resolveSessionSecret().
 * Edge middleware has no Node crypto; SHA-256 is available via Web Crypto.
 */
async function resolveSessionSecret(): Promise<string | null> {
  if (isExplicitSecretValid(process.env.ADMIN_SESSION_SECRET)) {
    return process.env.ADMIN_SESSION_SECRET!;
  }

  if (process.env.NODE_ENV !== 'production') {
    return process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-me';
  }

  const material =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_PASSWORD ||
    '';
  if (material.length < 32) return null;

  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(`portfolio-admin-session:${material}`),
  );
  return hexEncode(new Uint8Array(digest));
}

function hexEncode(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifies the HMAC signature and expiry of the admin session cookie using the
 * Web Crypto API (edge-compatible). Route handlers re-verify via getSession(),
 * so this is an early-reject defense-in-depth layer for /api/admin/*.
 */
async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token || token.length > 4096) return false;
  try {
    const decoded = atob(token);
    const dot = decoded.lastIndexOf('.');
    if (dot === -1) return false;
    const json = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);

    const enc = new TextEncoder();
    const secret = await resolveSessionSecret();
    if (!secret) return false;
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(json));
    const expected = hexEncode(new Uint8Array(sigBuf));

    if (!timingSafeEqualHex(sig, expected)) return false;

    const payload = JSON.parse(json) as { user?: string; exp?: number };
    if (typeof payload.user !== 'string' || payload.user.length === 0 || payload.user.length > 200) return false;
    if (typeof payload.exp !== 'number' || !Number.isSafeInteger(payload.exp)) return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect API admin routes — verify the cookie signature (not just presence).
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!(await isValidSession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Note: the /dashboard page guards itself server-side (renders the login form
  // when there is no session), so only the admin API needs middleware protection.
  matcher: ['/api/admin/:path*'],
};
