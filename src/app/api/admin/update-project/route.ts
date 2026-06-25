import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readContent, writeContent } from '@/lib/content';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, updates } = body;
  if (!id || !updates) return NextResponse.json({ error: 'Missing id or updates' }, { status: 400 });

  const content = await readContent();
  const index = content.projects.findIndex((p: any) => p.id === id);
  if (index === -1) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  content.projects[index] = { ...content.projects[index], ...updates };
  await writeContent(content);

  return NextResponse.json({ success: true, project: content.projects[index] });
}
