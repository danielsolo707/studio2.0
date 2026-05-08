import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    { error: 'Deprecated endpoint. Use /api/admin/upload/media with field "files".' },
    { status: 410 },
  );
}
