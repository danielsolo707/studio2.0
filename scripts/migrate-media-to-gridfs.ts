/**
 * Migration helper: move files from public/images|videos into GridFS
 * and update MongoDB content documents with new URLs.
 *
 * Run with: node -r ts-node/register scripts/migrate-media-to-gridfs.ts
 */
import fs from 'fs/promises';
import path from 'path';
import { ObjectId } from 'mongodb';
import { readContent, writeContent } from '../src/lib/content';
import { getBucket } from '../src/lib/gridfs';

const ROOT = process.cwd();

async function migrateDir(dir: 'images' | 'videos') {
  const bucket = await getBucket();
  const base = path.join(ROOT, 'public', dir);
  let files: string[] = [];
  try {
    files = await fs.readdir(base);
  } catch {
    return new Map<string, string>();
  }

  const map = new Map<string, string>(); // old path -> new url

  for (const name of files) {
    const full = path.join(base, name);
    const stat = await fs.stat(full);
    if (!stat.isFile()) continue;
    const data = await fs.readFile(full);
    const mime = dir === 'images' ? 'image/*' : 'video/*';
    const kind = dir === 'images' ? 'image' : 'video';

    const stream = bucket.openUploadStream(name, {
      contentType: mime,
      metadata: { kind, originalName: name },
    });

    await new Promise<void>((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(data);
    });

    const fileId = stream.id instanceof ObjectId ? stream.id.toHexString() : String(stream.id);
    const newUrl = `/api/media/${fileId}`;
    map.set(`/${dir}/${name}`, newUrl);
  }

  return map;
}

async function run() {
  const content = await readContent();
  const imageMap = await migrateDir('images');
  const videoMap = await migrateDir('videos');

  const rewriteUrl = (url: string | undefined) => {
    if (!url) return url;
    if (imageMap.has(url)) return imageMap.get(url)!;
    if (videoMap.has(url)) return videoMap.get(url)!;
    return url;
  };

  for (const project of content.projects) {
    project.imageUrl = rewriteUrl(project.imageUrl) || '';
    project.videoUrl = rewriteUrl(project.videoUrl) || '';
    project.media = (project.media || []).map((m) => {
      const nextUrl = rewriteUrl(m.url) || m.url;
      const storage = nextUrl.startsWith('/api/media/') ? 'gridfs' : m.storage;
      const fileId = nextUrl.startsWith('/api/media/') ? nextUrl.split('/').pop() : m.fileId;
      return { ...m, url: nextUrl, storage, fileId };
    });
  }

  await writeContent(content);
  console.log('Migration finished. Verify and remove old files manually if desired.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
