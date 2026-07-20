import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif',
  '.mp4', '.webm', '.mov',
]);
const SAFE_UPLOAD_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9]+$/i;

class PayloadTooLargeError extends Error {}

async function requireSession() {
  return Boolean(await getSession());
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function parseBoundedInteger(value: string | null, maximum: number): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > maximum) return null;
  return parsed;
}

function decodeFilename(metadata: string | null): string {
  const encoded = metadata
    ?.split(',')
    .map((item) => item.trim())
    .find((item) => item.startsWith('filename '))
    ?.slice('filename '.length);
  if (!encoded || encoded.length > 1024) return 'upload';

  try {
    return Buffer.from(encoded, 'base64').toString('utf8').slice(0, 255);
  } catch {
    return 'upload';
  }
}

function getSafeExtension(filename: string): string | null {
  const extension = path.extname(path.basename(filename)).toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension) ? extension : null;
}

function getUploadTarget(req: NextRequest): { name: string; length: number; path: string } | null {
  const name = req.nextUrl.searchParams.get('filename') || '';
  const length = parseBoundedInteger(req.nextUrl.searchParams.get('length'), MAX_UPLOAD_BYTES);
  const extension = path.extname(name).toLowerCase();
  if (!SAFE_UPLOAD_NAME.test(name) || !ALLOWED_EXTENSIONS.has(extension) || length === null) return null;
  return { name, length, path: path.join(UPLOAD_DIR, name) };
}

async function readBoundedBody(req: NextRequest, maximum: number): Promise<Buffer> {
  if (!req.body) return Buffer.alloc(0);
  const reader = req.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximum) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, total);
}

export async function POST(req: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uploadLength = parseBoundedInteger(req.headers.get('upload-length'), MAX_UPLOAD_BYTES);
  if (uploadLength === null || uploadLength === 0) {
    return NextResponse.json({ error: 'Upload-Length must be between 1 byte and 50 MB' }, { status: 400 });
  }

  const extension = getSafeExtension(decodeFilename(req.headers.get('upload-metadata')));
  if (!extension) {
    return NextResponse.json({ error: 'Unsupported media file extension' }, { status: 400 });
  }

  await ensureUploadDir();
  const uniqueName = `${crypto.randomUUID()}${extension}`;
  await fs.writeFile(path.join(UPLOAD_DIR, uniqueName), Buffer.alloc(0), { flag: 'wx' });
  const location = `/api/admin/upload/local?filename=${encodeURIComponent(uniqueName)}&length=${uploadLength}`;

  return new NextResponse(uniqueName, {
    status: 201,
    headers: {
      Location: location,
      'Upload-Offset': '0',
      'Upload-Length': String(uploadLength),
      'Tus-Resumable': '1.0.0',
      'Cache-Control': 'no-store',
    },
  });
}

export async function HEAD(req: NextRequest) {
  if (!(await requireSession())) {
    return new NextResponse(null, { status: 401 });
  }

  const target = getUploadTarget(req);
  if (!target) return new NextResponse(null, { status: 400 });

  try {
    const stats = await fs.stat(target.path);
    if (!stats.isFile() || stats.size > target.length) return new NextResponse(null, { status: 409 });
    return new NextResponse(null, {
      headers: {
        'Upload-Offset': String(stats.size),
        'Upload-Length': String(target.length),
        'Tus-Resumable': '1.0.0',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse(null, { status: 404, headers: { 'Tus-Resumable': '1.0.0' } });
    }
    console.error('TUS HEAD failed', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const target = getUploadTarget(req);
  const uploadOffset = parseBoundedInteger(req.headers.get('upload-offset'), MAX_UPLOAD_BYTES);
  if (!target || uploadOffset === null) {
    return NextResponse.json({ error: 'Invalid upload target or offset' }, { status: 400 });
  }

  try {
    const stats = await fs.stat(target.path);
    if (!stats.isFile()) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    if (stats.size !== uploadOffset) {
      return NextResponse.json(
        { error: 'Upload offset mismatch' },
        { status: 409, headers: { 'Upload-Offset': String(stats.size), 'Tus-Resumable': '1.0.0' } },
      );
    }

    const remaining = target.length - stats.size;
    if (remaining < 0) return NextResponse.json({ error: 'Upload exceeds declared length' }, { status: 409 });

    const declaredChunkLength = req.headers.get('content-length');
    if (declaredChunkLength) {
      const chunkLength = parseBoundedInteger(declaredChunkLength, MAX_UPLOAD_BYTES);
      if (chunkLength === null || chunkLength > remaining) throw new PayloadTooLargeError();
    }

    const chunk = await readBoundedBody(req, remaining);
    const newOffset = stats.size + chunk.byteLength;
    if (newOffset > target.length || newOffset > MAX_UPLOAD_BYTES) throw new PayloadTooLargeError();
    if (chunk.byteLength > 0) await fs.appendFile(target.path, chunk);

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Upload-Offset': String(newOffset),
        'Upload-Length': String(target.length),
        'Tus-Resumable': '1.0.0',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 });
    }
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }
    console.error('TUS PATCH failed', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
