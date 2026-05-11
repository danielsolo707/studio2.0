import fs from 'fs/promises';
import path from 'path';

const CAPTCHA_CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'captcha.json');

export type CaptchaConfig = {
  enabled: boolean;
};

const DEFAULT_CONFIG: CaptchaConfig = { enabled: false };

export async function readCaptchaConfig(): Promise<CaptchaConfig> {
  try {
    const raw = await fs.readFile(CAPTCHA_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as CaptchaConfig;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function writeCaptchaConfig(config: CaptchaConfig): Promise<void> {
  await fs.writeFile(CAPTCHA_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export async function isCaptchaEnabled(): Promise<boolean> {
  const config = await readCaptchaConfig();
  return Boolean(config.enabled);
}
