import fs from 'fs/promises';
import path from 'path';
import { isSupabaseConfigured } from './supabase';
import { readAppSettings, writeAppSettings } from '@/lib/platform/settings';
import { migrateLocalMessagesToSupabase } from '@/lib/contact/contact-log';
import { migrateAdminCredentialsToSupabase } from '@/lib/auth/credentials';

/**
 * One-time migration: copies locally-stored (JSON-file) data into Supabase so
 * that emails, 2FA, captcha, and the admin password hash all live in the
 * database instead of on disk.
 *
 * Every step is idempotent — re-running never duplicates rows or overwrites
 * values already present in the database. Safe to call on every dashboard load.
 * Silently no-ops if the `app_settings` table hasn't been created yet.
 */
export async function runMigrations(): Promise<void> {
  if (!isSupabaseConfigured) return;

  await Promise.allSettled([
    migrateLocalMessagesToSupabase(),
    migrateAdminCredentialsToSupabase(),
    migrateAppSettings(),
  ]);
}

/* ─── Migrate TOTP + captcha config into app_settings ─── */
async function readLocalJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), 'src', 'data', file),
      'utf-8',
    );
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

type AppSettingsRow = {
  totp_secret: string | null;
  totp_enabled: boolean | null;
  captcha_enabled: boolean | null;
};

async function migrateAppSettings(): Promise<void> {
  const [totpLocal, captchaLocal] = await Promise.all([
    readLocalJson<{ enabled: boolean; secret: string }>('totp.json'),
    readLocalJson<{ enabled: boolean }>('captcha.json'),
  ]);

  if (!totpLocal && !captchaLocal) return;

  // Read the current DB row so we never overwrite values already migrated.
  // If the table exists but the singleton row doesn't, `readAppSettings`
  // returns null; in that case we still try an upsert below so the row gets
  // created and local settings are copied into the database.
  const data = await readAppSettings('totp_secret, totp_enabled, captcha_enabled');

  const db: Partial<AppSettingsRow> = data ? (data as AppSettingsRow) : {};

  // True when the DB value is missing (NULL or row absent). We only fill
  // fields the database doesn't already have, so re-running is a no-op.
  const isMissing = (v: unknown) => v === null || v === undefined;

  const patch: Record<string, unknown> = {};

  if (captchaLocal && isMissing(db.captcha_enabled)) {
    patch.captcha_enabled = captchaLocal.enabled;
  }
  if (totpLocal) {
    if (isMissing(db.totp_enabled)) patch.totp_enabled = totpLocal.enabled;
    if (isMissing(db.totp_secret) && totpLocal.secret) patch.totp_secret = totpLocal.secret;
  }

  if (Object.keys(patch).length === 0) return; // nothing to patch

  const ok = await writeAppSettings(patch);
  if (!ok) return; // table not provisioned — skip silently

  console.log('[migrate] App security settings (2FA / captcha) copied to database.');
}
