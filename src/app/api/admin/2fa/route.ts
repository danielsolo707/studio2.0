import { NextResponse } from 'next/server';
import {
  clearPendingTotpSecret,
  getSession,
  readPendingTotpSecret,
  setPendingTotpSecret,
} from '@/lib/auth/session';
import {
  generateTotpSecret,
  readTotpConfig,
  verifyTotpToken,
  writeTotpConfig,
} from '@/lib/auth/totp';
import { consumeRateLimit, resetRateLimit } from '@/lib/security/rate-limit';
import { readLimitedJson } from '@/lib/security/request-body';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

async function readTotpToken(request: Request): Promise<string | null> {
  try {
    const body = await readLimitedJson(request, 1024) as { token?: unknown };
    const token = String(body?.token || '').trim();
    return /^\d{6}$/.test(token) ? token : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const config = await readTotpConfig();
  if (config.enabled) return json({ enabled: true });

  const { secret, qrCodeDataUrl } = await generateTotpSecret();
  await setPendingTotpSecret(secret);
  return json({ enabled: false, qrCodeDataUrl, secret });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const limitKey = `2fa-setup:${session.user}`;
  const rateLimit = consumeRateLimit(limitKey, 6, 5 * 60 * 1000);
  if (!rateLimit.allowed) {
    return json({ error: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` }, 429);
  }

  const token = await readTotpToken(request);
  if (!token) return json({ error: 'Enter a valid 6-digit code' }, 400);

  const pendingSecret = await readPendingTotpSecret();
  if (!pendingSecret) return json({ error: 'No pending setup found. Start setup again.' }, 400);
  if (!verifyTotpToken(pendingSecret, token)) return json({ error: 'Invalid code. Try again.' }, 400);

  await writeTotpConfig({ enabled: true, secret: pendingSecret });
  await clearPendingTotpSecret();
  resetRateLimit(limitKey);
  return json({ ok: true, message: '2FA enabled successfully' });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const config = await readTotpConfig();
  if (config.enabled && config.secret) {
    const limitKey = `2fa-disable:${session.user}`;
    const rateLimit = consumeRateLimit(limitKey, 6, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return json({ error: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` }, 429);
    }

    const token = await readTotpToken(request);
    if (!token || !verifyTotpToken(config.secret, token)) {
      return json({ error: 'A valid current authenticator code is required' }, 400);
    }
    resetRateLimit(limitKey);
  }

  await writeTotpConfig({ enabled: false, secret: '' });
  await clearPendingTotpSecret();
  return json({ ok: true, message: '2FA disabled' });
}
