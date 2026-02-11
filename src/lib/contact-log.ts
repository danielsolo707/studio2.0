import crypto from 'crypto';
import { getDb } from './db';

export type StoredMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  receivedAt: string; // ISO timestamp
  isRead: boolean;
  archived: boolean;
  replies?: MessageReply[];
};

export type MessageReply = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string; // ISO timestamp
};

function sanitize(text: string): string {
  // Strip simple HTML tags and collapse whitespace to reduce XSS risk.
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000); // prevent oversized payloads
}

const COLLECTION_NAME = 'messages';

export async function addMessage(entry: {
  name: string;
  email: string;
  message: string;
}): Promise<StoredMessage> {
  const db = await getDb();
  const collection = db.collection<StoredMessage>(COLLECTION_NAME);

  const saved: StoredMessage = {
    id: crypto.randomUUID(),
    name: sanitize(entry.name),
    email: sanitize(entry.email),
    message: sanitize(entry.message),
    receivedAt: new Date().toISOString(),
    isRead: false,
    archived: false,
    replies: [],
  };

  await collection.insertOne(saved);
  return saved;
}

export async function listMessages(limit = 100): Promise<StoredMessage[]> {
  const db = await getDb();
  const collection = db.collection<StoredMessage>(COLLECTION_NAME);

  const docs = await collection
    .find({})
    .sort({ receivedAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc: any) => {
    const { _id, replies = [], ...rest } = doc;
    return {
      ...rest,
      replies,
      isRead: doc.isRead ?? false,
      archived: doc.archived ?? false,
    } as StoredMessage;
  });
}

export async function updateMessage(
  id: string,
  updates: Partial<Pick<StoredMessage, 'isRead' | 'archived'>>,
): Promise<StoredMessage | null> {
  const db = await getDb();
  const collection = db.collection<StoredMessage>(COLLECTION_NAME);

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' },
  );

  return result ?? null;
}

export async function appendReply(id: string, reply: MessageReply): Promise<void> {
  const db = await getDb();
  const collection = db.collection<StoredMessage>(COLLECTION_NAME);
  await collection.updateOne(
    { id },
    { $push: { replies: reply }, $set: { isRead: true } },
  );
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection<StoredMessage>(COLLECTION_NAME);
  await collection.deleteOne({ id });
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const db = await getDb();
  const collection = db.collection<StoredMessage>(COLLECTION_NAME);

  await collection.deleteMany({ id: { $in: ids } });
}

