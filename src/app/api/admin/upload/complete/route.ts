import { NextResponse, type NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { getSession } from '@/lib/auth';
import { readContent, writeContent } from '@/lib/content';
import { getBucket } from '@/lib/gridfs';
import { getUpload, getCompletedChunks, readChunk, cleanupUpload } from '@/lib/upload-store';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

const THUMB_MAX_DIMENSION = 1600;

async function maybeMakeThumbnail(buffer: Buffer, mime: string) {
  try {
    const sharp = (await import('sharp')).default;
    const pipeline = sharp(buffer)
      .rotate()
      .resize({ width: THUMB_MAX_DIMENSION, height: THUMB_MAX_DIMENSION, fit: 'inside' });
    const format = mime === 'image/png' ? 'png' : 'jpeg';
    const out = await (format === 'png'
      ? pipeline.png({ quality: 80 })
      : pipeline.jpeg({ quality: 80 })
    ).toBuffer();
    const outMime = format === 'png' ? 'image/png' : 'image/jpeg';
    return { buffer: out, mime: outMime };
  } catch {
    return null;
  }
}

async function* chunkGenerator(uploadId: string, totalChunks: number) {
  for (let i = 0; i < totalChunks; i++) {
    yield await readChunk(uploadId, i);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { uploadId } = body;

    if (!uploadId) {
      return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
    }

    const meta = await getUpload(uploadId);
    if (!meta) {
      return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
    }

    const completed = await getCompletedChunks(uploadId);
    if (completed.length !== meta.totalChunks) {
      return NextResponse.json(
        { error: `Missing chunks: received ${completed.length}/${meta.totalChunks}` },
        { status: 400 },
      );
    }

    const kind = meta.fileType.startsWith('image/') ? 'image' : 'video';
    const bucket = await getBucket();
    const content = await readContent();

    const projIndex = content.projects.findIndex((p) => p.id === meta.projectId);
    if (projIndex === -1) {
      await cleanupUpload(uploadId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Stream all chunks to GridFS
    const uploadStream = bucket.openUploadStream(meta.filename, {
      contentType: meta.fileType,
      metadata: {
        projectId: meta.projectId,
        kind,
        originalName: meta.filename,
        mime: meta.fileType,
        role: 'original',
      },
    });

    const readable = Readable.from(chunkGenerator(uploadId, meta.totalChunks));
    readable.pipe(uploadStream);
    await finished(uploadStream);

    const fileId =
      uploadStream.id instanceof ObjectId
        ? uploadStream.id.toHexString()
        : String(uploadStream.id);
    const url = `/api/media/${fileId}`;
    let thumbUrl: string | undefined;
    let thumbFileId: string | undefined;

    // Generate thumbnail for images
    if (kind === 'image') {
      const chunks: Buffer[] = [];
      for (let i = 0; i < meta.totalChunks; i++) {
        chunks.push(await readChunk(uploadId, i));
      }
      const fullBuffer = Buffer.concat(chunks);
      const thumb = await maybeMakeThumbnail(fullBuffer, meta.fileType);
      if (thumb) {
        const thumbStream = bucket.openUploadStream(`thumb-${meta.filename}`, {
          contentType: thumb.mime,
          metadata: {
            projectId: meta.projectId,
            kind,
            originalName: meta.filename,
            mime: thumb.mime,
            role: 'thumb',
          },
        });
        Readable.from(thumb.buffer).pipe(thumbStream);
        await finished(thumbStream);
        thumbFileId =
          thumbStream.id instanceof ObjectId
            ? thumbStream.id.toHexString()
            : String(thumbStream.id);
        thumbUrl = `/api/media/${thumbFileId}`;
      }
    }

    // Update content
    const project = content.projects[projIndex];
    project.media = project.media || [];
    project.media.push({
      type: kind,
      url,
      storage: 'gridfs',
      fileId,
      thumbUrl,
      thumbFileId,
    });
    if (kind === 'image' && !project.imageUrl) {
      project.imageUrl = url;
    }
    if (kind === 'video' && !project.videoUrl) {
      project.videoUrl = url;
    }

    await writeContent(content);

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/projects/${meta.projectId}`);

    // Clean up temp files
    await cleanupUpload(uploadId);

    return NextResponse.json({
      ok: true,
      file: { fileId, url, kind, thumbUrl, thumbFileId },
    });
  } catch (err) {
    console.error('Upload complete failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Complete failed' },
      { status: 500 },
    );
  }
}
