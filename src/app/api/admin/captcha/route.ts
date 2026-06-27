import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { readCaptchaConfig, writeCaptchaConfig } from '@/lib/security/captcha-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await readCaptchaConfig();
  return NextResponse.json({ enabled: config.enabled });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await writeCaptchaConfig({ enabled: true });
  return NextResponse.json({ ok: true, enabled: true });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await writeCaptchaConfig({ enabled: false });
  return NextResponse.json({ ok: true, enabled: false });
}
