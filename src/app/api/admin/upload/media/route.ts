import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { readContent, writeContent } from '@/lib/content';
import { uploadFile } from '@/lib/gridfs';

export const runtime = 'nodejs';

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
    const kind = detectKind({ type: mimeType } as File);
    if (!projectId) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }
    if (kind === 'unknown') {
      return NextResponse.json({ error: `Unsupported file type: ${mimeType}` }, { status: 400 });
    }

    const content = await readContent();
    const projIndex = content.projects.findIndex((p) => p.id === projectId);
    if (projIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const buffer = Buffer.from(await request.arrayBuffer());

    const fileId = await uploadFile(buffer, filename, mimeType);
    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
    const url = `/uploads/${fileId}${ext}`;
    let thumbUrl: string | undefined;

    if (kind === 'image') {
      const thumb = await maybeMakeThumbnail(buffer, mimeType || 'image/jpeg');
      if (thumb) {
        const thumbId = await uploadFile(thumb.buffer, `thumb-${filename}`, thumb.mime);
        thumbUrl = `/uploads/${thumbId}${ext}`;
      }
    }

    const saved = [{ fileId, url, kind, thumbUrl }];

    const project = content.projects[projIndex];
    project.media = project.media || [];
    for (const item of saved) {
      project.media.push({
        type: item.kind,
        url: item.url,
        storage: 'local',
        fileId: item.fileId,
        thumbUrl: item.thumbUrl,
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
