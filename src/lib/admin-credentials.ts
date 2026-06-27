import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { isSupabaseConfigured, supabaseServer, TABLES } from './supabase';
import { readAppSettings, writeAppSettings } from './app-settings';

type StoredAdminCredentials = {
  username: string;
  passwordHash: string;
  passwordSalt: string;
  updatedAt: string;
};

const CREDENTIALS_PATH = path.join(process.cwd(), 'src', 'data', 'admin-credentials.json');
const KEY_LENGTH = 64;

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || 'admin';
}

/* ─── Local JSON fallback (dev only) ─── */
async function readStoredCredentialsFile(): Promise<StoredAdminCredentials | null> {
  try {
    const raw = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StoredAdminCredentials;
    if (!parsed.username || !parsed.passwordHash || !parsed.passwordSalt) return null;
    return parsed;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw error;
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/* ─── Supabase path ───
 * Returns null when the table isn't provisioned yet (silent) so the caller
 * falls back to env/local storage. */
async function readStoredCredentialsDB(): Promise<{ passwordHash: string; passwordSalt: string } | null> {
  const row = await readAppSettings('password_hash, password_salt');
  if (!row?.password_hash || !row?.password_salt) return null;
  return {
    passwordHash: row.password_hash as string,
    passwordSalt: row.password_salt as string,
  };
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = getAdminUsername();
  if (username !== expectedUser) return false;

  // Primary: password hash stored in the database (app_settings).
  if (isSupabaseConfigured) {
    const stored = await readStoredCredentialsDB();
    if (stored) {
      const candidate = hashPassword(password, stored.passwordSalt);
      return safeEqualHex(candidate, stored.passwordHash);
    }
    // No DB row yet (or table not provisioned) — fall through to env / dev defaults.
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword) return password === envPassword;
    return process.env.NODE_ENV !== 'production' && password === 'change-me';
  }

  // Fallback: local JSON file (dev without Supabase).
  const stored = await readStoredCredentialsFile();
  if (stored) {
    const candidate = hashPassword(password, stored.passwordSalt);
    return safeEqualHex(candidate, stored.passwordHash);
  }

  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) {
    return process.env.NODE_ENV !== 'production' && password === 'change-me';
  }

  return password === envPassword;
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(newPassword, salt);
  const updatedAt = new Date().toISOString();

  const ok = await writeAppSettings({
    password_hash: passwordHash,
    password_salt: salt,
    password_updated_at: updatedAt,
  });
  if (ok) return;

  // Table not provisioned yet → keep working via local file.
  const credentials: StoredAdminCredentials = {
    username: getAdminUsername(),
    passwordSalt: salt,
    passwordHash,
    updatedAt,
  };

  await fs.mkdir(path.dirname(CREDENTIALS_PATH), { recursive: true });
  await fs.writeFile(CREDENTIALS_PATH, `${JSON.stringify(credentials, null, 2)}\n`, 'utf-8');
}

/* ─── Migration helper (called once by migrate.ts) ───
 * Copies a locally-stored password hash into the database so the admin
 * keeps the same password after switching to DB storage. Idempotent:
 * does nothing if the DB already has a password hash or the table is missing.
 */
export async function migrateAdminCredentialsToSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const existing = await readStoredCredentialsDB();
  if (existing) return false; // already in DB

  const local = await readStoredCredentialsFile();
  if (!local) return false; // nothing to migrate

  const ok = await writeAppSettings({
    password_hash: local.passwordHash,
    password_salt: local.passwordSalt,
    password_updated_at: local.updatedAt,
  });

  if (!ok) return false; // table not provisioned yet — skip silently

  console.log('[migrate] Admin password hash copied to database.');
  return true;
}
