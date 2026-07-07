import crypto from 'crypto';
import { isSupabaseConfigured } from '@/lib/database/supabase';
import { readAppSettings, writeAppSettings } from '@/lib/platform/settings';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AiSettings = {
  publicModel: string;
  adminModel: string;
  apiKey: string;
};

const DEFAULT_MODEL = 'google/diffusiongemma-26b-a4b-it';

const ENV_FALLBACK: AiSettings = {
  publicModel: process.env.NVIDIA_NIM_MODEL || DEFAULT_MODEL,
  adminModel: process.env.NVIDIA_NIM_MODEL || DEFAULT_MODEL,
  apiKey: process.env.NVIDIA_NIM_API_KEY || process.env.HERMES_API_KEY || '',
};

// ─── AES-256-GCM encryption ────────────────────────────────────────────────
// Uses the existing ADMIN_SESSION_SECRET as the encryption key source
// (derived via scrypt). No new env var needed.

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function deriveKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is required for AI key encryption');
  return crypto.scryptSync(secret, 'ai-settings-key', KEY_LENGTH);
}

function encrypt(plaintext: string): { encrypted: string; iv: string } {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag(); // appended automatically by GCM
  // Combine tag + encrypted for storage
  return {
    encrypted: Buffer.concat([tag, Buffer.from(encrypted, 'base64')]).toString('base64'),
    iv: iv.toString('base64'),
  };
}

function decrypt(encryptedB64: string, ivB64: string): string {
  const key = deriveKey();
  const combined = Buffer.from(encryptedB64, 'base64');
  const tag = combined.subarray(0, TAG_LENGTH);
  const ciphertext = combined.subarray(TAG_LENGTH);
  const iv = Buffer.from(ivB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(ciphertext.toString('base64'), 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── Read / Write AI settings from DB ───────────────────────────────────────

/**
 * Read AI settings from DB (with decryption), falling back to env vars.
 * Returns the two models + decrypted API key.
 */
export async function readAiSettings(): Promise<AiSettings> {
  if (!isSupabaseConfigured) return { ...ENV_FALLBACK };

  try {
    const data = await readAppSettings(
      'ai_public_model, ai_admin_model, ai_api_key_encrypted, ai_api_key_iv',
    );
    if (!data) return { ...ENV_FALLBACK };

    const publicModel =
      typeof data.ai_public_model === 'string' && data.ai_public_model
        ? data.ai_public_model
        : ENV_FALLBACK.publicModel;

    const adminModel =
      typeof data.ai_admin_model === 'string' && data.ai_admin_model
        ? data.ai_admin_model
        : ENV_FALLBACK.adminModel;

    let apiKey = ENV_FALLBACK.apiKey;
    const encKey = data.ai_api_key_encrypted as string | null;
    const encIv = data.ai_api_key_iv as string | null;
    if (encKey && encIv) {
      try {
        apiKey = decrypt(encKey, encIv);
      } catch {
        console.error('[ai-settings] Failed to decrypt API key, using env fallback.');
      }
    }

    return { publicModel, adminModel, apiKey };
  } catch {
    return { ...ENV_FALLBACK };
  }
}

/**
 * Get config for a specific chat mode (public or admin).
 */
export async function getAiConfigForMode(
  mode: 'public' | 'admin',
): Promise<{ apiKey: string; model: string }> {
  const settings = await readAiSettings();
  return {
    apiKey: settings.apiKey,
    model: mode === 'public' ? settings.publicModel : settings.adminModel,
  };
}

/**
 * Write AI settings to DB (with encryption).
 * If apiKey is empty string, keeps the existing key unchanged.
 * Returns true if written, false if DB not provisioned.
 */
export async function writeAiSettings(settings: {
  publicModel: string;
  adminModel: string;
  apiKey: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  // If apiKey is empty, read the current encrypted key so we don't blank it.
  let encryptedKey = '';
  let keyIv = '';
  if (settings.apiKey.trim()) {
    const { encrypted, iv } = encrypt(settings.apiKey.trim());
    encryptedKey = encrypted;
    keyIv = iv;
  } else {
    // Keep existing — read current values
    try {
      const data = await readAppSettings('ai_api_key_encrypted, ai_api_key_iv');
      if (data) {
        encryptedKey = (data.ai_api_key_encrypted as string) || '';
        keyIv = (data.ai_api_key_iv as string) || '';
      }
    } catch {
      // first time — no existing key
    }
  }

  return writeAppSettings({
    ai_public_model: settings.publicModel.trim() || null,
    ai_admin_model: settings.adminModel.trim() || null,
    ai_api_key_encrypted: encryptedKey || null,
    ai_api_key_iv: keyIv || null,
  });
}
