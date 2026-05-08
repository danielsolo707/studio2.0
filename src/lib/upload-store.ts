import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(os.tmpdir(), 'studio-uploads');
const TTL_MS = 24 * 60 * 60 * 1000;

export interface UploadMeta {
  uploadId: string;
  filename: string;
  fileSize: number;
  fileType: string;
  projectId: string;
  chunkSize: number;
  totalChunks: number;
  createdAt: string;
}

function isValidUploadId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function uploadDir(uploadId: string): string {
  if (!isValidUploadId(uploadId)) throw new Error('Invalid upload ID');
  return path.join(UPLOAD_DIR, uploadId);
}

export async function createUpload(
  params: Pick<UploadMeta, 'filename' | 'fileSize' | 'fileType' | 'projectId' | 'chunkSize'>,
): Promise<UploadMeta> {
  const uploadId = crypto.randomUUID();
  const totalChunks = Math.ceil(params.fileSize / params.chunkSize);
  const meta: UploadMeta = {
    ...params,
    uploadId,
    totalChunks,
    createdAt: new Date().toISOString(),
  };

  const dir = uploadDir(uploadId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify(meta));

  // Best-effort cleanup of old uploads
  cleanupOldUploads().catch(() => {});

  return meta;
}

export async function getUpload(uploadId: string): Promise<UploadMeta | null> {
  try {
    const metaPath = path.join(uploadDir(uploadId), 'meta.json');
    const data = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveChunk(uploadId: string, chunkIndex: number, data: Buffer): Promise<void> {
  const chunkPath = path.join(uploadDir(uploadId), `chunk-${chunkIndex}`);
  await fs.writeFile(chunkPath, data);
}

export async function getCompletedChunks(uploadId: string): Promise<number[]> {
  try {
    const dir = uploadDir(uploadId);
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.startsWith('chunk-'))
      .map((f) => parseInt(f.split('-')[1], 10))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export async function readChunk(uploadId: string, chunkIndex: number): Promise<Buffer> {
  const chunkPath = path.join(uploadDir(uploadId), `chunk-${chunkIndex}`);
  return fs.readFile(chunkPath);
}

export async function cleanupUpload(uploadId: string): Promise<void> {
  try {
    await fs.rm(uploadDir(uploadId), { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

async function cleanupOldUploads(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const entries = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();

    for (const entry of entries) {
      try {
        if (!isValidUploadId(entry)) continue;
        const meta = await getUpload(entry);
        if (meta && now - new Date(meta.createdAt).getTime() > TTL_MS) {
          await cleanupUpload(entry);
        }
      } catch {
        // Skip invalid entries
      }
    }
  } catch {
    // Ignore
  }
}
