import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
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

  // Generate a new secret for setup
  const { secret, qrCodeDataUrl } = await generateTotpSecret();

  // Store the secret temporarily (not yet enabled)
  await writeTotpConfig({ enabled: false, secret });

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

  const config = await readTotpConfig();

  if (!config.secret) {
    return NextResponse.json(
      { error: 'No secret generated. Start setup first (GET /api/admin/2fa).' },
      { status: 400 },
    );
  }

  const isValid = verifyTotpToken(config.secret, token);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 });
  }

  // Enable 2FA
  await writeTotpConfig({ enabled: true, secret: config.secret });

  return NextResponse.json({ ok: true, message: '2FA enabled successfully' });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await writeTotpConfig({ enabled: false, secret: '' });

  return NextResponse.json({ ok: true, message: '2FA disabled' });
}
