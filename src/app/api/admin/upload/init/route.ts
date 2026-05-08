import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { createUpload } from '@/lib/upload-store';

export const runtime = 'nodejs';

const MAX_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB max per chunk

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { filename, fileSize, fileType, projectId, chunkSize } = body;

    if (!filename || !fileSize || !fileType || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (typeof fileSize !== 'number' || fileSize <= 0) {
      return NextResponse.json({ error: 'Invalid file size' }, { status: 400 });
    }

    const resolvedChunkSize = Math.min(chunkSize || 5 * 1024 * 1024, MAX_CHUNK_SIZE);

    const meta = await createUpload({
      filename,
      fileSize,
      fileType,
      projectId,
      chunkSize: resolvedChunkSize,
    });

    return NextResponse.json({
      uploadId: meta.uploadId,
      chunkSize: meta.chunkSize,
      totalChunks: meta.totalChunks,
    });
  } catch (err) {
    console.error('Upload init failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Init failed' },
      { status: 500 },
    );
  }
}
