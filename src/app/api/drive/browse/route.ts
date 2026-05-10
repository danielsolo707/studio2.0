import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listDriveFiles, listDriveFolders, isDriveConfigured, type DriveFile, type DriveCredentials } from '@/lib/google-drive';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface DriveBrowseResponse {
  folders: DriveFile[];
  files: DriveFile[];
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDriveConfigured()) {
    return NextResponse.json({ error: 'Google Drive not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId') || undefined;

  const cookieStore = await cookies();
  const credStr = cookieStore.get('gdrive_credentials')?.value;
  if (!credStr) {
    return NextResponse.json({ error: 'Not connected to Google Drive' }, { status: 401 });
  }

  try {
    const credentials: DriveCredentials = JSON.parse(credStr);
    const [folders, files] = await Promise.all([
      listDriveFolders(credentials, folderId),
      listDriveFiles(credentials, folderId),
    ]);

    return NextResponse.json({ folders, files } as DriveBrowseResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to browse Drive';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
