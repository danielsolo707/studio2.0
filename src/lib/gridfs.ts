import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function getBucket() {
  // No longer needed — media is stored on the local filesystem.
  // Kept as a no‑op for backward compatibility.
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

export async function deleteGridFsFile(fileId: string) {
  return deleteFile(fileId);
}
