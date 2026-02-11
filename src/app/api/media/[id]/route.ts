import { NextResponse, type NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getBucket } from '@/lib/gridfs';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: 'Invalid media id' }, { status: 400 });
  }

  const bucket = await getBucket();
  const files = await bucket.find({ _id: objectId }).toArray();
  if (files.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const file = files[0];
  const mime = (file.metadata as any)?.mime || file.contentType || 'application/octet-stream';
  const size = Number(file.length);

  const headers: Record<string, string> = {
    'Content-Type': mime,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
  };

  // Handle range requests (videos)
  const range = _req.headers.get('range');
  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : size - 1;
      const chunkSize = end - start + 1;
      const stream = bucket.openDownloadStream(objectId, { start, end: end + 1 });
      return new Response(stream as any, {
        status: 206,
        headers: {
          ...headers,
          'Content-Length': String(chunkSize),
          'Content-Range': `bytes ${start}-${end}/${size}`,
        },
      });
    }
  }

  const stream = bucket.openDownloadStream(objectId);
  return new Response(stream as any, {
    headers: {
      ...headers,
      'Content-Length': String(size),
    },
  });
}
