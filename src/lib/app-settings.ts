import { isSupabaseConfigured, supabaseServer, TABLES } from './supabase';

/**
 * True for the PostgREST error thrown when a table hasn't been created in the
 * database yet ("Could not find the table 'public.x' in the schema cache").
 *
 * This is an EXPECTED state before the one-time schema migration is run, so
 * callers treat it as "feature not provisioned" and fall back to local/env
 * storage rather than logging an error.
 */
export function isTableMissingError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : (error as { message?: unknown })?.message;
  const msg = typeof message === 'string' ? message : String(message ?? error);
  return /Could not find the table/i.test(msg) || /schema cache/i.test(msg);
}

/**
 * Read selected columns from the `app_settings` singleton row.
 *
 * Returns the row object, or `null` if Supabase isn't configured OR the
 * `app_settings` table hasn't been created yet (so the caller can fall back
 * to local/env storage). Other DB errors are logged and also return `null`.
 */
export async function readAppSettings(
  columns: string,
): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabaseServer()
    .from(TABLES.APP_SETTINGS)
    .select(columns)
    .eq('id', 'default')
    .maybeSingle();

  if (error) {
    // Table-not-created-yet is expected → silent fallback. Anything else is real.
    if (!isTableMissingError(error)) {
      console.error('Error reading app_settings:', error.message);
    }
    return null;
  }

  return data ? (data as unknown as Record<string, unknown>) : null;
}

/**
 * Upsert a patch into the `app_settings` singleton row.
 *
 * Returns `true` on success, `false` if Supabase isn't configured OR the
 * `app_settings` table hasn't been created yet (caller should fall back to
 * local/env storage). Throws on any other DB error.
 */
export async function writeAppSettings(
  patch: Record<string, unknown>,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabaseServer()
    .from(TABLES.APP_SETTINGS)
    .upsert({ id: 'default', ...patch }, { onConflict: 'id' });

  if (error) {
    if (isTableMissingError(error)) return false; // not provisioned → fallback
    throw new Error(`Failed to write app_settings: ${error.message}`);
  }

  return true;
}
