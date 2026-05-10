import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { isDriveConfigured } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDriveConfigured()) {
    return NextResponse.json({ error: 'Google Drive not configured' }, { status: 500 });
  }

  const cookieStore = await cookies();
  const credentials = cookieStore.get('gdrive_credentials')?.value;

  if (credentials) {
    return NextResponse.json({ connected: true });
  }

  return NextResponse.json({ connected: false });
}
