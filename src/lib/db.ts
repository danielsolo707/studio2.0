import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getMongoUri(): string {
  // Prefer explicit MongoDB URI, but also support DATABASE_URL for convenience.
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!uri && process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI or DATABASE_URL environment variable is required in production');
  }

  // In development, fall back to localhost if no env is provided.
  return uri || 'mongodb://127.0.0.1:27017/portfolio';
}

export function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const uri = getMongoUri();
    const isSrv = uri.startsWith('mongodb+srv://');
    client = new MongoClient(uri, {
      // Keep resource usage low on small/weak servers
      maxPoolSize: 10,
      minPoolSize: 0,
      retryWrites: true,
      retryReads: true,
      serverSelectionTimeoutMS: 15_000,
      connectTimeoutMS: 30_000,
      socketTimeoutMS: 180_000,
      tls: isSrv ? true : undefined,
      directConnection: !isSrv ? true : undefined, // direct for single-host URIs
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
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
}
