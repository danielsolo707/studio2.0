import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

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

async function readStoredCredentials(): Promise<StoredAdminCredentials | null> {
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

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = getAdminUsername();
  if (username !== expectedUser) return false;

  const stored = await readStoredCredentials();
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
  const credentials: StoredAdminCredentials = {
    username: getAdminUsername(),
    passwordSalt: salt,
    passwordHash: hashPassword(newPassword, salt),
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(CREDENTIALS_PATH), { recursive: true });
  await fs.writeFile(CREDENTIALS_PATH, `${JSON.stringify(credentials, null, 2)}\n`, 'utf-8');
}
