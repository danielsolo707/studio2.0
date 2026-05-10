import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { downloadDriveFile, getFileMetadata, isDriveConfigured, type DriveCredentials } from '@/lib/google-drive';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDriveConfigured()) {
    return NextResponse.json({ error: 'Google Drive not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const credStr = cookieStore.get('gdrive_credentials')?.value;
  if (!credStr) {
    return NextResponse.json({ error: 'Not connected to Google Drive' }, { status: 401 });
  }

  try {
    const credentials: DriveCredentials = JSON.parse(credStr);
    const [buffer, metadata] = await Promise.all([
      downloadDriveFile(credentials, fileId),
      getFileMetadata(credentials, fileId),
    ]);

    const mimeMap: Record<string, string> = {
      'application/vnd.google-apps.folder': 'folder',
      'image/jpeg': 'image/jpeg',
      'image/png': 'image/png',
      'image/webp': 'image/webp',
      'video/mp4': 'video/mp4',
      'video/webm': 'video/webm',
    };

    const mimeType = mimeMap[metadata.mimeType] || 'application/octet-stream';
    const filename = metadata.name || 'download.bin';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
        'X-File-Id': fileId,
        'X-Original-Name': filename,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to download file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
