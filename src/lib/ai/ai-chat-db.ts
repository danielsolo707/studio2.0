import crypto from 'crypto';
import { isSupabaseConfigured, supabaseServer, TABLES } from '@/lib/database/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChatSession = {
  id: string;
  mode: 'public' | 'admin';
  ip: string | null;
  session_cookie: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  created_at: string;
};

export type ChatSessionWithMessages = ChatSession & {
  messages: ChatMessage[];
};

// ─── Session management ─────────────────────────────────────────────────────

/**
 * Create a new chat session. Returns the session ID.
 * Falls back to a random UUID if Supabase is not configured.
 */
export async function createChatSession(
  mode: 'public' | 'admin',
  options?: { ip?: string; sessionCookie?: string },
): Promise<string> {
  if (!isSupabaseConfigured) return crypto.randomUUID();

  const { data, error } = await supabaseServer()
    .from(TABLES.AI_CHAT_SESSIONS)
    .insert({
      mode,
      ip: options?.ip || null,
      session_cookie: options?.sessionCookie || null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error creating chat session:', error);
    return crypto.randomUUID();
  }

  return data.id as string;
}

// ─── Message management ────────────────────────────────────────────────────

/**
 * Add a message to a session. If Supabase is not configured, silently skips.
 */
export async function addChatMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  model?: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabaseServer()
    .from(TABLES.AI_CHAT_MESSAGES)
    .insert({
      session_id: sessionId,
      role,
      content,
      model: model || null,
    });

  if (error) {
    console.error('Error adding chat message:', error);
  }
}

/**
 * Get all messages for a specific session, ordered by creation time.
 */
export async function getMessagesForSession(
  sessionId: string,
): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabaseServer()
    .from(TABLES.AI_CHAT_MESSAGES)
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.error('Error fetching session messages:', error);
    return [];
  }

  return (data as any[]).map(mapMessageFromDB);
}

// ─── History / listing ─────────────────────────────────────────────────────

/**
 * List chat sessions for a given mode, newest first.
 */
export async function listSessions(
  mode: 'public' | 'admin',
  limit = 50,
): Promise<ChatSession[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabaseServer()
    .from(TABLES.AI_CHAT_SESSIONS)
    .select('*')
    .eq('mode', mode)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('Error listing chat sessions:', error);
    return [];
  }

  return (data as any[]).map(mapSessionFromDB);
}

/**
 * Get full chat history for a mode (sessions with their messages).
 * Most recent sessions first; messages within each session ordered chronologically.
 */
export async function getChatHistory(
  mode: 'public' | 'admin',
  limit = 50,
): Promise<ChatSessionWithMessages[]> {
  if (!isSupabaseConfigured) return [];

  const sessions = await listSessions(mode, limit);

  // Fetch messages for all sessions in parallel
  const withMessages = await Promise.all(
    sessions.map(async (session) => {
      const messages = await getMessagesForSession(session.id);
      return { ...session, messages };
    }),
  );

  return withMessages;
}

// ─── DB mappers ────────────────────────────────────────────────────────────

function mapSessionFromDB(row: any): ChatSession {
  return {
    id: row.id,
    mode: row.mode,
    ip: row.ip ?? null,
    session_cookie: row.session_cookie ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapMessageFromDB(row: any): ChatMessage {
  return {
    id: row.id,
    session_id: row.session_id,
    role: row.role,
    content: row.content,
    model: row.model ?? null,
    created_at: row.created_at,
  };
}
