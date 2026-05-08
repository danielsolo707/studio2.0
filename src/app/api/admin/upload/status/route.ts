import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUpload, getCompletedChunks } from '@/lib/upload-store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploadId = request.nextUrl.searchParams.get('uploadId') || '';
    if (!uploadId) {
      return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
    }

    const meta = await getUpload(uploadId);
    if (!meta) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    const completedChunks = await getCompletedChunks(uploadId);

    return NextResponse.json({
      uploadId: meta.uploadId,
      totalChunks: meta.totalChunks,
      completedChunks,
    });
  } catch (err) {
    console.error('Upload status failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Status check failed' },
      { status: 500 },
    );
  }
}
