import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client module.
 *
 * Exports two clients:
 * - `supabaseServer` — uses the service_role key (bypasses RLS).
 *   Only for server-side code (server actions, API routes, migration scripts).
 * - `supabaseBrowser` — uses the anon key (subject to RLS policies).
 *   Safe for client-side reads.
 *
 * If env vars are not set, `isSupabaseConfigured` returns false and the
 * data layer falls back to JSON-file storage. This keeps the app working
 * during development and before Supabase is provisioned.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/** True when all three env vars are present. */
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && ANON_KEY && SERVICE_KEY,
);

/** Storage bucket names — must match what we create on the Supabase side. */
export const BUCKETS = {
  PROJECT_MEDIA: 'project-media',
  UPLOADS: 'uploads',
} as const;

/** Server-side client (service role — full access, bypasses RLS). */
let _serverClient: SupabaseClient | null = null;
export function supabaseServer(): SupabaseClient {
  if (!_serverClient) {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, ' +
          'NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local',
      );
    }
    _serverClient = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _serverClient;
}

/** Browser-side client (anon key — subject to RLS). */
let _browserClient: SupabaseClient | null = null;
export function supabaseBrowser(): SupabaseClient {
  if (!_browserClient) {
    if (!SUPABASE_URL || !ANON_KEY) {
      throw new Error(
        'Supabase browser client requires NEXT_PUBLIC_SUPABASE_URL and ' +
          'NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      );
    }
    _browserClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return _browserClient;
}

/** Table names — single source of truth. */
export const TABLES = {
  PROJECTS: 'projects',
  SITE_CONTENT: 'site_content',
  CONTACT_MESSAGES: 'contact_messages',
} as const;
