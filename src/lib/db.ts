import { MongoClient, Db } from 'mongodb';
import { getEnvVar } from './env';

let clientInstance: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let _isConnected = false;

function getMongoUri(): string {
  return getEnvVar('MONGODB_URI', 'mongodb://127.0.0.1:27017/portfolio');
}

async function getMongoClient(): Promise<MongoClient> {
  if (!clientInstance) {
    const uri = getMongoUri();
    
    // Check if this is a local development URI
    const isLocalDev = uri.includes('127.0.0.1') || uri.includes('localhost');
    
    if (!clientPromise) {
      clientPromise = MongoClient.connect(uri, {
        serverSelectionTimeoutMS: isLocalDev ? 2000 : 5000, // Shorter timeout for local dev
      })
        .then(client => {
          clientInstance = client;
          _isConnected = true;
          if (process.env.NODE_ENV === 'development' && !isLocalDev) {
            console.log('✅ MongoDB connected successfully (remote)');
          } else if (process.env.NODE_ENV === 'development') {
            console.log('✅ MongoDB connected successfully (local)');
          }
          return client;
        })
        .catch(error => {
          _isConnected = false;
          // Only show error in production or for non-local development
          if (process.env.NODE_ENV === 'production' || !isLocalDev) {
            console.error('❌ MongoDB connection failed:', error.message);
          } else {
            console.log('ℹ️  Local MongoDB not available, using mock database');
          }
          
          // Return a mock client for development
          if (process.env.NODE_ENV === 'development') {
            return createMockClient();
          }
          throw error;
        });
    }
    return clientPromise;
  }
  return clientInstance;
}

// Mock client for development when MongoDB is unavailable
function createMockClient(): MongoClient {
  const mockClient = {
    db: (_dbName?: string) => ({
      collection: (_name: string) => {
        const baseCollection = {
          find: () => {
            const queryResult = {
              toArray: async () => [],
              sort: () => queryResult,
              limit: () => queryResult
            };
            return queryResult;
          },
          insertOne: async () => ({ insertedId: 'mock-id' }),
          updateOne: async () => ({ modifiedCount: 1 }),
          deleteOne: async () => ({ deletedCount: 1 }),
          findOne: async () => null
        };
        return baseCollection;
      },
      grid: {
        openUploadStream: () => ({
          id: 'mock-file-id',
          on: (event: string, callback: (...args: unknown[]) => void) => {
            if (event === 'finish') setTimeout(callback, 100);
          },
          end: () => {}
        }),
        openDownloadStream: () => ({
          on: (event: string, callback: (...args: unknown[]) => void) => {
            if (event === 'data') setTimeout(() => callback(Buffer.from('')), 100);
            if (event === 'end') setTimeout(callback, 200);
          }
        }),
        find: () => ({
          toArray: async () => []
        })
      }
    }),
    close: async () => {},
    isConnected: () => false
  } as unknown as MongoClient;
  
  return mockClient;
}

export async function getDb(): Promise<Db> {
  try {
    const uri = getMongoUri();
    const client = await getMongoClient();

    // If MONGODB_DB is set, prefer that; otherwise derive from URI path or fallback.
    const explicitName = process.env.MONGODB_DB;
    if (explicitName) {
      return client.db(explicitName);
    }

    try {
      const url = new URL(uri);
      const fromPath = url.pathname.replace('/', '');
      return client.db(fromPath || 'portfolio');
    } catch {
      return client.db('portfolio');
    }
  } catch (error) {
    // Only log database access errors in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Database access error:', error);
    }
    // Return mock database for graceful degradation
    return createMockClient().db('portfolio');
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.collection('health').findOne({});
    return true;
  } catch {
    return false;
  }
}
