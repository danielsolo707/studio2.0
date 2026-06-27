import fs from 'fs/promises';
import path from 'path';
import { readAppSettings, writeAppSettings } from '@/lib/platform/settings';

const CAPTCHA_CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'captcha.json');

export type CaptchaConfig = {
  enabled: boolean;
};

const DEFAULT_CONFIG: CaptchaConfig = { enabled: false };

/* Primary store: Supabase `app_settings` (captcha_enabled).
 * Fallback: local JSON file — used in dev, or when the `app_settings` table
 * hasn't been created in the database yet (silent, no errors). */

export async function readCaptchaConfig(): Promise<CaptchaConfig> {
  const row = await readAppSettings('captcha_enabled');
  if (row) {
    return { enabled: Boolean(row.captcha_enabled) };
  }

  try {
    const raw = await fs.readFile(CAPTCHA_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as CaptchaConfig;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function writeCaptchaConfig(config: CaptchaConfig): Promise<void> {
  const ok = await writeAppSettings({ captcha_enabled: config.enabled });
  if (ok) return;

  // Table not provisioned yet → keep working via local file.
  await fs.writeFile(CAPTCHA_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export async function isCaptchaEnabled(): Promise<boolean> {
  const config = await readCaptchaConfig();
  return Boolean(config.enabled);
}
