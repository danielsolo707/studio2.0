import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readContent, updateProject } from '@/lib/content';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, updates } = body;
  if (!id || !updates) return NextResponse.json({ error: 'Missing id or updates' }, { status: 400 });

  const content = await readContent();
  const exists = content.projects.some((p: any) => p.id === id);
  if (!exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  await updateProject(id, updates);

  return NextResponse.json({ success: true });
}
