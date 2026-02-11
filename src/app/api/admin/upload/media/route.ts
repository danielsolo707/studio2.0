import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/auth';
import { readContent, writeContent } from '@/lib/content';
import { getBucket } from '@/lib/gridfs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

export const runtime = 'nodejs';

const IMAGE_MAX = 20 * 1024 * 1024; // 20MB
const VIDEO_MAX = 200 * 1024 * 1024; // 200MB
const THUMB_MAX_DIMENSION = 1600;

function detectKind(file: File): 'image' | 'video' | 'unknown' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'unknown';
}

async function maybeMakeThumbnail(buffer: Buffer, mime: string) {
  try {
    const sharp = (await import('sharp')).default;
    const pipeline = sharp(buffer).rotate().resize({ width: THUMB_MAX_DIMENSION, height: THUMB_MAX_DIMENSION, fit: 'inside' });
    const format = mime === 'image/png' ? 'png' : 'jpeg';
    const out = await (format === 'png' ? pipeline.png({ quality: 80 }) : pipeline.jpeg({ quality: 80 })).toBuffer();
    const outMime = format === 'png' ? 'image/png' : 'image/jpeg';
    return { buffer: out, mime: outMime };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = (request.headers.get('x-project-id') || '').trim();
    const filename = request.headers.get('x-file-name') || 'upload.bin';
    const mimeType = request.headers.get('x-file-type') || request.headers.get('content-type') || 'application/octet-stream';
    const contentLength = Number(request.headers.get('content-length') || 0);
    const kind = detectKind({ type: mimeType } as File);
    if (!projectId) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }
    if (kind === 'unknown') {
      return NextResponse.json({ error: `Unsupported file type: ${mimeType}` }, { status: 400 });
    }
    const limit = kind === 'image' ? IMAGE_MAX : VIDEO_MAX;
    if (contentLength && contentLength > limit) {
      return NextResponse.json(
        { error: `${filename} too large (${(contentLength / 1024 / 1024).toFixed(1)}MB). Max ${kind === 'image' ? '20MB' : '200MB'}.` },
        { status: 400 },
      );
    }

    const bucket = await getBucket();
    const content = await readContent();
    const saved: Array<{
      fileId: string;
      url: string;
      kind: 'image' | 'video';
      thumbUrl?: string;
      thumbFileId?: string;
    }> = [];

    const projIndex = content.projects.findIndex((p) => p.id === projectId);
    if (projIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Stream upload
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimeType,
      metadata: {
        projectId,
        kind,
        originalName: filename,
        mime: mimeType,
        role: 'original',
      },
    });

    const nodeStream = Readable.fromWeb(request.body as any);
    const imageChunks: Buffer[] = [];
    let total = 0;

    nodeStream.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > limit) {
        nodeStream.destroy(new Error(`${filename} too large. Limit ${kind === 'image' ? '20MB' : '200MB'}`));
        return;
      }
      if (kind === 'image') imageChunks.push(chunk);
    });

    nodeStream.pipe(uploadStream);
    await finished(uploadStream);

    const fileId = uploadStream.id instanceof ObjectId ? uploadStream.id.toHexString() : String(uploadStream.id);
    const url = `/api/media/${fileId}`;
    let thumbUrl: string | undefined;
    let thumbFileId: string | undefined;

    if (kind === 'image' && imageChunks.length > 0) {
      const buffer = Buffer.concat(imageChunks);
      const thumb = await maybeMakeThumbnail(buffer, mimeType || 'image/jpeg');
      if (thumb) {
        const thumbStream = bucket.openUploadStream(`thumb-${filename}`, {
          contentType: thumb.mime,
          metadata: {
            projectId,
            kind,
            originalName: filename,
            mime: thumb.mime,
            role: 'thumb',
          },
        });
        Readable.from(thumb.buffer).pipe(thumbStream);
        await finished(thumbStream);
        thumbFileId =
          thumbStream.id instanceof ObjectId ? thumbStream.id.toHexString() : String(thumbStream.id);
        thumbUrl = `/api/media/${thumbFileId}`;
      }
    }

    saved.push({ fileId, url, kind, thumbUrl, thumbFileId });

    const project = content.projects[projIndex];
    project.media = project.media || [];
    for (const item of saved) {
      project.media.push({
        type: item.kind,
        url: item.url,
        storage: 'gridfs',
        fileId: item.fileId,
        thumbUrl: item.thumbUrl,
        thumbFileId: item.thumbFileId,
      });
      if (item.kind === 'image' && !project.imageUrl) {
        project.imageUrl = item.url;
      }
      if (item.kind === 'video' && !project.videoUrl) {
        project.videoUrl = item.url;
      }
    }

    await writeContent(content);

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/projects/${projectId}`);

    return NextResponse.json({ ok: true, files: saved });
  } catch (err) {
    console.error('Upload media failed', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
