import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { isSupabaseConfigured, supabaseServer, TABLES } from '@/lib/database/supabase';
import {
  supabaseAddMessage,
  supabaseListMessages,
  supabaseUpdateMessage,
  supabaseAppendReply,
  supabaseDeleteMessage,
  supabaseBulkDeleteMessages,
} from '@/lib/database/supabase-db';

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

/* ─── Local JSON fallback (dev only — used when Supabase isn't configured) ─── */

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
  if (isSupabaseConfigured) {
    return supabaseAddMessage({
      name: sanitize(entry.name),
      email: sanitize(entry.email),
      message: sanitize(entry.message),
    });
  }

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
  if (isSupabaseConfigured) {
    return supabaseListMessages(limit);
  }
  const messages = await readAll();
  return messages.slice(0, limit);
}

export async function updateMessage(
  id: string,
  updates: Partial<Pick<StoredMessage, 'isRead' | 'archived'>>,
): Promise<StoredMessage | null> {
  if (isSupabaseConfigured) {
    return supabaseUpdateMessage(id, updates);
  }
  const messages = await readAll();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  messages[idx] = { ...messages[idx], ...updates };
  await writeAll(messages);
  return messages[idx];
}

export async function appendReply(id: string, reply: MessageReply): Promise<void> {
  if (isSupabaseConfigured) {
    return supabaseAppendReply(id, reply);
  }
  const messages = await readAll();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return;
  messages[idx].replies = [...(messages[idx].replies || []), reply];
  messages[idx].isRead = true;
  await writeAll(messages);
}

export async function deleteMessage(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    return supabaseDeleteMessage(id);
  }
  const messages = await readAll();
  await writeAll(messages.filter((m) => m.id !== id));
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (isSupabaseConfigured) {
    return supabaseBulkDeleteMessages(ids);
  }
  if (ids.length === 0) return;
  const messages = await readAll();
  await writeAll(messages.filter((m) => !ids.includes(m.id)));
}

/* ─── Migration helper (called once by migrate.ts) ───
 * Copies all locally-stored contact messages into the database. Idempotent:
 * uses upsert keyed on the message id, so re-running never duplicates rows.
 */
export async function migrateLocalMessagesToSupabase(): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  const local = await readAll();
  if (local.length === 0) return 0;

  // Existing DB ids, so we only insert messages that aren't already migrated.
  const existing = await supabaseListMessages(10000);
  const existingIds = new Set(existing.map((m) => m.id));
  const toMigrate = local.filter((m) => !existingIds.has(m.id));
  if (toMigrate.length === 0) return 0;

  const rows = toMigrate.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    message: m.message,
    received_at: m.receivedAt,
    is_read: m.isRead,
    archived: m.archived,
    replies: m.replies ?? [],
  }));

  const { error } = await supabaseServer()
    .from(TABLES.CONTACT_MESSAGES)
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    console.error('Failed to migrate contact messages to DB:', error.message);
    return 0;
  }
  console.log(`[migrate] ${toMigrate.length} contact message(s) copied to database.`);
  return toMigrate.length;
}
