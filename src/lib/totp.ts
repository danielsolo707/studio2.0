import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';

const TOTP_CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'totp.json');

export type TotpConfig = {
  enabled: boolean;
  secret: string; // base32-encoded secret
};

const DEFAULT_CONFIG: TotpConfig = { enabled: false, secret: '' };

/* ─── Read / Write ─── */

export async function readTotpConfig(): Promise<TotpConfig> {
  try {
    const raw = await fs.readFile(TOTP_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as TotpConfig;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function writeTotpConfig(config: TotpConfig): Promise<void> {
  await fs.writeFile(TOTP_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

/* ─── Generate ─── */

/**
 * Generates a new TOTP secret and returns the base32 secret
 * plus a data-URL QR code that can be scanned by
 * Microsoft Authenticator / Google Authenticator / etc.
 */
export async function generateTotpSecret(): Promise<{
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}> {
  const generated = speakeasy.generateSecret({
    name: 'The Fluid Logic Admin',
    issuer: 'MotionVerse',
    length: 20,
  });

  const secret = generated.base32;
  const otpauthUrl =
    generated.otpauth_url ??
    speakeasy.otpauthURL({
      secret: generated.ascii,
      label: 'The Fluid Logic Admin',
      issuer: 'MotionVerse',
    });

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return { secret, otpauthUrl, qrCodeDataUrl };
}

/* ─── Verify ─── */

/**
 * Verifies a 6-digit TOTP token against the stored secret.
 * Uses a 1-step window (±30 s) to account for clock drift.
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // ±30 seconds tolerance
  });
}

/* ─── Helpers ─── */

export async function is2FAEnabled(): Promise<boolean> {
  const config = await readTotpConfig();
  return config.enabled && !!config.secret;
}
