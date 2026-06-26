import { NextResponse } from 'next/server';
import { getSession, setPendingTotpSecret, readPendingTotpSecret, clearPendingTotpSecret } from '@/lib/auth';
import {
  generateTotpSecret,
  readTotpConfig,
  writeTotpConfig,
  verifyTotpToken,
} from '@/lib/totp';

export const runtime = 'nodejs';

/**
 * GET  → returns current 2FA status + QR code for setup
 * POST → enables 2FA after verifying the first token
 * DELETE → disables 2FA
 */

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await readTotpConfig();

  // If already enabled, don't expose the secret again
  if (config.enabled) {
    return NextResponse.json({ enabled: true });
  }

  // Generate a new secret for setup. It is kept in a short-lived signed
  // cookie (not on disk) until verification completes.
  const { secret, qrCodeDataUrl } = await generateTotpSecret();
  await setPendingTotpSecret(secret);

  return NextResponse.json({
    enabled: false,
    qrCodeDataUrl,
    secret, // show base32 secret for manual entry
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const token = String(body.token || '').trim();

  if (!token || token.length !== 6) {
    return NextResponse.json({ error: 'Enter a valid 6-digit code' }, { status: 400 });
  }

  const pendingSecret = await readPendingTotpSecret();
  if (!pendingSecret) {
    return NextResponse.json(
      { error: 'No pending setup found. Start setup again.' },
      { status: 400 },
    );
  }

  const isValid = verifyTotpToken(pendingSecret, token);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 });
  }

  // Enable 2FA and persist the now-verified secret
  await writeTotpConfig({ enabled: true, secret: pendingSecret });
  await clearPendingTotpSecret();

  return NextResponse.json({ ok: true, message: '2FA enabled successfully' });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await writeTotpConfig({ enabled: false, secret: '' });
  await clearPendingTotpSecret();

  return NextResponse.json({ ok: true, message: '2FA disabled' });
}
