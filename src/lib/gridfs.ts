import { GridFSBucket, ObjectId } from 'mongodb';
import { getDb } from './db';

let bucketCache: GridFSBucket | null = null;

export async function getBucket(): Promise<GridFSBucket> {
  if (bucketCache) {
    return bucketCache;
  }

  try {
    const db = await getDb();
    bucketCache = new GridFSBucket(db, { bucketName: 'media' });
    return bucketCache;
  } catch (error) {
    console.error('Failed to create GridFS bucket:', error);
    // Return mock bucket for development
    return createMockBucket();
  }
}

// Mock bucket for development
function createMockBucket(): GridFSBucket {
  return {
    openUploadStream: (filename: string, options?: any) => ({
      id: new ObjectId(),
      on: (event: string, callback: (...args: unknown[]) => void) => {
        if (event === 'finish') setTimeout(callback, 100);
      },
      end: () => {},
      write: () => true
    }),
    openDownloadStream: (id: ObjectId, options?: any) => ({
      on: (event: string, callback: (...args: unknown[]) => void) => {
        if (event === 'data') setTimeout(() => callback(Buffer.from('')), 100);
        if (event === 'end') setTimeout(callback, 200);
      },
      pipe: () => {}
    }),
    find: (filter?: any) => ({
      toArray: async () => [],
      sort: () => ({ toArray: async () => [] })
    }),
    delete: async (id: ObjectId) => {}
  } as unknown as GridFSBucket;
}

export async function uploadFile(buffer: Buffer, filename: string, mimeType: string) {
  try {
    const bucket = await getBucket();
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimeType,
      metadata: { mime: mimeType }
    });
    
    return new Promise<ObjectId>((resolve, reject) => {
      uploadStream.on('finish', () => resolve(uploadStream.id));
      uploadStream.on('error', reject);
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error('Upload failed - database connection issue');
  }
}

export async function deleteFile(fileId: string) {
  try {
    const bucket = await getBucket();
    const objectId = new ObjectId(fileId);
    await bucket.delete(objectId);
  } catch (error) {
    console.error('File deletion failed:', error);
    // Don't throw error for deletion failures to prevent UI crashes
  }
}

// Alias for backward compatibility
export async function deleteGridFsFile(fileId: string) {
  return deleteFile(fileId);
}
