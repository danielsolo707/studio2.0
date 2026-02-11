import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { readContent, writeContent } from '@/lib/content';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Deprecated endpoint. Use /api/admin/upload/media with field "files".' },
    { status: 410 },
  );
}
