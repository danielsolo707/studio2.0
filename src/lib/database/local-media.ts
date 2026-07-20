import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Local filesystem media helpers under `public/uploads`.
 * Used as a dev/fallback path; production prefers Supabase Storage.
 */
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  _mimeType: string,
): Promise<string> {
  await ensureDir();
  const id = crypto.randomUUID();
  const ext = path.extname(filename);
  const savedName = `${id}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, savedName), buffer);
  return id;
}

export async function deleteFile(fileId: string) {
  await ensureDir();
  const files = await fs.readdir(UPLOAD_DIR);
  for (const name of files) {
    if (name.startsWith(fileId)) {
      await fs.unlink(path.join(UPLOAD_DIR, name));
      break;
    }
  }
}

/** @deprecated Use deleteFile — kept for existing call sites. */
export async function deleteLocalMediaFile(fileId: string) {
  return deleteFile(fileId);
}
