import { GridFSBucket, ObjectId } from 'mongodb';
import { getMongoClient } from './db';

export type GridFsMeta = {
  projectId: string;
  kind: 'image' | 'video';
  originalName: string;
  mime: string;
};

export async function getBucket() {
  const client = await getMongoClient();
  const db = client.db(); // uses default derived in getDb()
  return new GridFSBucket(db, { bucketName: 'media' });
}

export async function deleteGridFsFile(fileId: string) {
  const bucket = await getBucket();
  try {
    await bucket.delete(new ObjectId(fileId));
  } catch {
    // ignore missing
  }
}
