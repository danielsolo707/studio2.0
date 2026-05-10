import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { exchangeCodeForTokens, isDriveConfigured } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isDriveConfigured()) {
    return NextResponse.json({ error: 'Google Drive not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard?gdrive_error=${encodeURIComponent(error)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?gdrive_error=no_code', request.url));
  }

  const expectedState = (await cookies()).get('gdrive_oauth_state')?.value;
  if (state && expectedState && state !== expectedState) {
    return NextResponse.redirect(new URL('/dashboard?gdrive_error=invalid_state', request.url));
  }

  try {
    const credentials = await exchangeCodeForTokens(code);
    
    const cookieStore = await cookies();
    cookieStore.set('gdrive_credentials', JSON.stringify(credentials), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.redirect(new URL('/dashboard?gdrive_connected=true', request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.redirect(new URL(`/dashboard?gdrive_error=${encodeURIComponent(message)}`, request.url));
  }
}
