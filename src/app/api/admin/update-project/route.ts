import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { readContent, updateProject } from '@/lib/cms/content';
import { readLimitedJson, RequestBodyTooLargeError } from '@/lib/security/request-body';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await readLimitedJson(req, 256 * 1024);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: 'Request body is too large' }, { status: 413 });
    }
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { id, updates } = body as { id?: unknown; updates?: unknown };
  if (
    typeof id !== 'string' ||
    !/^[a-z0-9-]{1,200}$/.test(id) ||
    !updates ||
    typeof updates !== 'object' ||
    Array.isArray(updates)
  ) {
    return NextResponse.json({ error: 'Invalid id or updates' }, { status: 400 });
  }

  const content = await readContent();
  const exists = content.projects.some((p: any) => p.id === id);
  if (!exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  await updateProject(id, updates as Parameters<typeof updateProject>[1]);

  revalidatePath('/');
  revalidatePath('/works/motion');
  revalidatePath(`/projects/${id}`);
  revalidatePath('/dashboard');

  return NextResponse.json({ success: true });
}
