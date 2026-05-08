import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUpload, saveChunk } from '@/lib/upload-store';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploadId = (request.headers.get('x-upload-id') || '').trim();
    const chunkIndex = parseInt(request.headers.get('x-chunk-index') || '', 10);

    if (!uploadId) {
      return NextResponse.json({ error: 'Missing upload ID' }, { status: 400 });
    }
    if (isNaN(chunkIndex) || chunkIndex < 0) {
      return NextResponse.json({ error: 'Invalid chunk index' }, { status: 400 });
    }

    const meta = await getUpload(uploadId);
    if (!meta) {
      return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
    }
    if (chunkIndex >= meta.totalChunks) {
      return NextResponse.json({ error: 'Chunk index out of range' }, { status: 400 });
    }

    const buffer = Buffer.from(await request.arrayBuffer());
    await saveChunk(uploadId, chunkIndex, buffer);

    return NextResponse.json({ received: chunkIndex });
  } catch (err) {
    console.error('Chunk upload failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chunk upload failed' },
      { status: 500 },
    );
  }
}
