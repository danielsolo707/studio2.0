import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getAuthorizationUrl, isDriveConfigured } from '@/lib/google-drive';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDriveConfigured()) {
    return NextResponse.json({ error: 'Google Drive not configured' }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const authUrl = getAuthorizationUrl(state);

  if (!authUrl) {
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set('gdrive_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  return NextResponse.redirect(authUrl);
}
