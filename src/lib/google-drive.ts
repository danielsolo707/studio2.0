import { getEnvVar } from './env';

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
];

const DRIVE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export interface DriveCredentials {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  parents?: string[];
}

function getDriveConfig() {
  return {
    clientId: getEnvVar('GOOGLE_DRIVE_CLIENT_ID', ''),
    clientSecret: getEnvVar('GOOGLE_DRIVE_CLIENT_SECRET', ''),
    redirectUri: getEnvVar('GOOGLE_DRIVE_REDIRECT_URI', `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/api/auth/google-drive/callback`),
  };
}

export function getAuthorizationUrl(state: string): string {
  const config = getDriveConfig();
  if (!config.clientId) return '';
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: DRIVE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  
  return `${DRIVE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<DriveCredentials> {
  const config = getDriveConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Google Drive credentials not configured');
  }

  const response = await fetch(DRIVE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<DriveCredentials> {
  const config = getDriveConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Google Drive credentials not configured');
  }

  const response = await fetch(DRIVE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return response.json();
}

async function getValidAccessToken(credentials: DriveCredentials): Promise<string> {
  if (credentials.expiry_date && credentials.expiry_date > Date.now() + 60000) {
    return credentials.access_token;
  }
  
  if (!credentials.refresh_token) {
    throw new Error('No refresh token available');
  }
  
  const refreshed = await refreshAccessToken(credentials.refresh_token);
  return refreshed.access_token;
}

export async function listDriveFiles(
  credentials: DriveCredentials,
  folderId?: string
): Promise<DriveFile[]> {
  const token = await getValidAccessToken(credentials);
  
  const query = folderId 
    ? `'${folderId}' in parents and trashed = false`
    : 'trashed = false and "root" in parents';
  
  const params = new URLSearchParams({
    q: query,
    fields: 'files(id,name,mimeType,size,webViewLink,thumbnailLink,modifiedTime,parents)',
    orderBy: 'modifiedTime desc',
    pageSize: '100',
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list files: ${error}`);
  }

  const data = await response.json();
  return data.files || [];
}

export async function listDriveFolders(
  credentials: DriveCredentials,
  parentId?: string
): Promise<DriveFile[]> {
  const token = await getValidAccessToken(credentials);
  
  let query = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
  if (parentId) {
    query = `'${parentId}' in parents and ${query}`;
  }

  const params = new URLSearchParams({
    q: query,
    fields: 'files(id,name,mimeType,parents)',
    orderBy: 'name',
    pageSize: '100',
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list folders: ${error}`);
  }

  const data = await response.json();
  return data.files || [];
}

export async function downloadDriveFile(
  credentials: DriveCredentials,
  fileId: string
): Promise<ArrayBuffer> {
  const token = await getValidAccessToken(credentials);

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to download file: ${error}`);
  }

  return response.arrayBuffer();
}

export async function getFileMetadata(
  credentials: DriveCredentials,
  fileId: string
): Promise<DriveFile> {
  const token = await getValidAccessToken(credentials);

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,modifiedTime`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get file metadata: ${error}`);
  }

  return response.json();
}

export function isDriveConfigured(): boolean {
  const config = getDriveConfig();
  return Boolean(config.clientId && config.clientSecret);
}
