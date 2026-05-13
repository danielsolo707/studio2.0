import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

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

    const files = await fs.readdir(UPLOAD_DIR);
    const match = files.find((f) => f.startsWith(id));
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
        const fd = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(chunkSize);
        await fd.read(buffer, 0, chunkSize, start);
        await fd.close();
        return new Response(buffer, {
          status: 206,
          headers: {
            ...headers,
            'Content-Length': String(chunkSize),
            'Content-Range': `bytes ${start}-${end}/${size}`,
          },
        });
      }
    }

    const buffer = await fs.readFile(filePath);
    return new Response(buffer, {
      headers: { ...headers, 'Content-Length': String(size) },
    });
  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
