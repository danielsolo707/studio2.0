import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!UUID.test(id)) {
      return NextResponse.json({ error: 'Invalid media id' }, { status: 400 });
    }

    const files = await fs.readdir(UPLOAD_DIR);
    const match = files.find((file) => file.startsWith(`${id}.`));
    if (!match) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const filePath = path.join(UPLOAD_DIR, match);
    const ext = path.extname(match).toLowerCase();
    const mime = MIME_MAP[ext] || 'application/octet-stream';
    const stat = await fs.stat(filePath);
    const size = stat.size;
    const etag = `"${id}"`;

    const headers: Record<string, string> = {
      'Content-Type': mime,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': etag,
    };

    const range = _req.headers.get('range');
    if (range) {
      const matchRange = /bytes=(\d+)-(\d*)/.exec(range);
      if (matchRange) {
        const start = Number(matchRange[1]);
        const end = matchRange[2] ? Number(matchRange[2]) : size - 1;
        if (start >= size || end >= size || start > end) {
          return new Response('Requested Range Not Satisfiable', {
            status: 416,
            headers: { 'Content-Range': `bytes */${size}` },
          });
        }
        const chunkSize = end - start + 1;
        const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
        return new Response(stream, {
          status: 206,
          headers: {
            ...headers,
            'Content-Length': String(chunkSize),
            'Content-Range': `bytes ${start}-${end}/${size}`,
          },
        });
      }
    }

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new Response(stream, {
      headers: { ...headers, 'Content-Length': String(size) },
    });
  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
