import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export type StoredMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  receivedAt: string;
  isRead: boolean;
  archived: boolean;
  replies?: MessageReply[];
};

export type MessageReply = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  sent?: boolean;
};

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'contact-log.json');

let cache: StoredMessage[] | null = null;

async function readAll(): Promise<StoredMessage[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    cache = JSON.parse(raw) as StoredMessage[];
  } catch {
    cache = [];
  }
  return cache!;
}

async function writeAll(messages: StoredMessage[]): Promise<void> {
  cache = messages;
  await fs.writeFile(DATA_PATH, JSON.stringify(messages, null, 2), 'utf-8');
}

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 2000);
}

export async function addMessage(entry: {
  name: string;
  email: string;
  message: string;
}): Promise<StoredMessage> {
  const messages = await readAll();
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
  messages.unshift(saved);
  await writeAll(messages);
  return saved;
}

export async function listMessages(limit = 100): Promise<StoredMessage[]> {
  const messages = await readAll();
  return messages.slice(0, limit);
}

export async function updateMessage(
  id: string,
  updates: Partial<Pick<StoredMessage, 'isRead' | 'archived'>>,
): Promise<StoredMessage | null> {
  const messages = await readAll();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  messages[idx] = { ...messages[idx], ...updates };
  await writeAll(messages);
  return messages[idx];
}

export async function appendReply(id: string, reply: MessageReply): Promise<void> {
  const messages = await readAll();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return;
  messages[idx].replies = [...(messages[idx].replies || []), reply];
  messages[idx].isRead = true;
  await writeAll(messages);
}

export async function deleteMessage(id: string): Promise<void> {
  const messages = await readAll();
  await writeAll(messages.filter((m) => m.id !== id));
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const messages = await readAll();
  await writeAll(messages.filter((m) => !ids.includes(m.id)));
}
