import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCaptcha, serializeCaptcha } from '@/lib/captcha';

const CAPTCHA_COOKIE = 'login_captcha';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const captcha = await generateCaptcha();
    const serialized = serializeCaptcha(captcha);
    
    const cookieStore = await cookies();
    cookieStore.set(CAPTCHA_COOKIE, serialized, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60,
      path: '/',
    });
    
    return NextResponse.json({
      question: captcha.question,
    });
  } catch (error) {
    console.error('CAPTCHA generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate CAPTCHA' },
      { status: 500 }
    );
  }
}
