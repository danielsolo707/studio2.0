"use server"

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { deleteGridFsFile } from '@/lib/gridfs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { clearSession, getSession, setSession } from '@/lib/auth';
import { readContent, writeContent } from '@/lib/content';
import { is2FAEnabled, readTotpConfig, verifyTotpToken } from '@/lib/totp';
import type { Project } from '@/types/project';
import { listMessages, updateMessage, deleteMessage, bulkDelete, appendReply } from '@/lib/contact-log';

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Abc138282';

/* ─── Zod schemas ─── */
const aboutSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  headline: z.string().min(1, 'Headline is required'),
  body: z.string().min(1, 'Body is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

const projectSchema = z.object({
  id: z.string().min(1, 'ID is required').regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1, 'Name is required'),
  year: z.string().min(4, 'Year is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color hex'),
  imageUrl: z.string(),
  videoUrl: z.string().optional().default(''),
  description: z.string().min(1, 'Description is required'),
  tools: z.string().min(1, 'Tools are required'),
  category: z.string().min(1, 'Category is required'),
});

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/dashboard');
  }
  return session;
}

export async function loginAction(
  _prev: { error?: string; needs2FA?: boolean },
  formData: FormData,
) {
  const user = String(formData.get('username') || '').trim();
  const pass = String(formData.get('password') || '').trim();

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return { error: 'Invalid username or password' };
  }

  // Check if 2FA is enabled
  const twoFAEnabled = await is2FAEnabled();
  if (twoFAEnabled) {
    return { needs2FA: true };
  }

  await setSession(user);
  redirect('/dashboard');
}

/**
 * Verify TOTP code after successful password authentication.
 */
export async function verify2FAAction(
  _prev: { error?: string },
  formData: FormData,
) {
  const token = String(formData.get('totp') || '').trim();

  if (!token || token.length !== 6) {
    return { error: 'Enter a valid 6-digit code' };
  }

  const config = await readTotpConfig();
  if (!config.enabled || !config.secret) {
    // 2FA not configured — shouldn't reach here, but handle gracefully
    await setSession(ADMIN_USER);
    redirect('/dashboard');
  }

  const isValid = verifyTotpToken(config.secret, token);
  if (!isValid) {
    return { error: 'Invalid code. Please try again.' };
  }

  await setSession(ADMIN_USER);
  redirect('/dashboard');
}

export async function logoutAction() {
  await clearSession();
  redirect('/dashboard');
}

/** ---- Messages actions ---- */
export async function markReadAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get('id') || '');
  if (!id) return;
  await updateMessage(id, { isRead: true });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/messages');
}

export async function toggleArchiveAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get('id') || '');
  const archive = String(formData.get('archive') || '') === 'true';
  if (!id) return;
  await updateMessage(id, { archived: archive });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/messages');
}

export async function deleteMessageAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get('id') || '');
  if (!id) return;
  await deleteMessage(id);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/messages');
}

export async function bulkDeleteAction(_prev: any, formData: FormData) {
  await requireAuth();
  const idsRaw = String(formData.get('ids') || '');
  if (!idsRaw) return;
  const ids = idsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return;
  await bulkDelete(ids);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/messages');
}

const replySchema = z.object({
  id: z.string().min(1),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function replyMessageAction(_prev: { error?: string }, formData: FormData) {
  await requireAuth();
  const parsed = replySchema.safeParse({
    id: String(formData.get('id') || ''),
    to: String(formData.get('to') || ''),
    subject: String(formData.get('subject') || ''),
    body: String(formData.get('body') || ''),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return { error: 'Resend not configured' };
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: parsed.data.to,
        subject: parsed.data.subject,
        text: parsed.data.body,
      }),
    });
    const reply = {
      id: crypto.randomUUID(),
      to: parsed.data.to,
      subject: parsed.data.subject,
      body: parsed.data.body,
      sentAt: new Date().toISOString(),
    };
    await appendReply(parsed.data.id, reply);
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/messages');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to send reply' };
  }
}

export async function updateAboutAction(formData: FormData) {
  await requireAuth();
  const label = String(formData.get('label') || '').trim();
  const headline = String(formData.get('headline') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const skillsRaw = String(formData.get('skills') || '').trim();
  const skills = skillsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const result = aboutSchema.safeParse({ label, headline, body, skills });
  if (!result.success) {
    // Validation failed — redirect back (plain form, no useActionState)
    redirect('/dashboard');
  }

  const content = await readContent();
  content.about = { label, headline, body, skills };
  await writeContent(content);

  revalidatePath('/');
  redirect('/dashboard');
}

function coerceProject(formData: FormData, existing?: Project): { data?: Project; error?: string } {
  const raw = {
    id: String(formData.get('id') || existing?.id || '').trim(),
    name: String(formData.get('name') || existing?.name || '').trim(),
    year: String(formData.get('year') || existing?.year || '').trim(),
    color: String(formData.get('color') || existing?.color || '#DFFF00').trim(),
    imageUrl: String(formData.get('imageUrl') || existing?.imageUrl || '').trim(),
    videoUrl: String(formData.get('videoUrl') || existing?.videoUrl || '').trim(),
    description: String(formData.get('description') || existing?.description || '').trim(),
    tools: String(formData.get('tools') || existing?.tools || '').trim(),
    category: String(formData.get('category') || existing?.category || '').trim(),
  };

  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0]?.message ?? 'Invalid project data' };
  }

  return {
    data: {
      ...result.data,
      videoUrl: result.data.videoUrl ?? '',
      media: existing?.media || [],
    },
  };
}

export async function addProjectAction(formData: FormData) {
  await requireAuth();
  const content = await readContent();
  const { data: project, error } = coerceProject(formData);

  if (error || !project) {
    redirect('/dashboard');
  }

  if (content.projects.some((p) => p.id === project.id)) {
    redirect('/dashboard');
  }

  content.projects.push(project);
  await writeContent(content);

  revalidatePath('/');
  revalidatePath('/projects');
  redirect('/dashboard');
}

export async function updateProjectAction(formData: FormData) {
  await requireAuth();
  const content = await readContent();
  const id = String(formData.get('id') || '').trim();
  const index = content.projects.findIndex((p) => p.id === id);
  if (index === -1) redirect('/dashboard');

  const { data: next, error } = coerceProject(formData, content.projects[index]);
  if (error || !next) redirect('/dashboard');

  content.projects[index] = next;
  await writeContent(content);

  revalidatePath('/');
  revalidatePath(`/projects/${id}`);
  redirect('/dashboard');
}

export async function deleteProjectAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get('id') || '').trim();
  const content = await readContent();
  content.projects = content.projects.filter((p) => p.id !== id);
  await writeContent(content);

  revalidatePath('/');
  revalidatePath('/projects');
  redirect('/dashboard');
}

export async function deleteMediaAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get('id') || '').trim();
  const url = String(formData.get('url') || '').trim();
  const fileId = String(formData.get('fileId') || '').trim();
  const storage = String(formData.get('storage') || '').trim();
  const thumbFileId = String(formData.get('thumbFileId') || '').trim();

  const content = await readContent();
  const index = content.projects.findIndex((p) => p.id === id);
  if (index === -1) redirect('/dashboard');

  const project = content.projects[index];
  project.media = (project.media || []).filter((m) => m.url !== url);

  if (project.imageUrl === url) project.imageUrl = '';
  if (project.videoUrl === url) project.videoUrl = '';

  await writeContent(content);

  if (storage === 'gridfs') {
    if (fileId) await deleteGridFsFile(fileId);
    if (thumbFileId) await deleteGridFsFile(thumbFileId);
  } else if (url.startsWith('/images/') || url.startsWith('/videos/')) {
    const targetPath = path.join(process.cwd(), 'public', url);
    try {
      await fs.unlink(targetPath);
    } catch {
      // Ignore missing files
    }
  }

  revalidatePath('/');
  revalidatePath(`/projects/${id}`);
  redirect('/dashboard');
}

export async function reorderMediaAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get('id') || '').trim();
  const url = String(formData.get('url') || '').trim();
  const direction = String(formData.get('direction') || '').trim();

  if (!id || !url || !direction) redirect('/dashboard');

  const content = await readContent();
  const index = content.projects.findIndex((p) => p.id === id);
  if (index === -1) redirect('/dashboard');

  const media = content.projects[index].media || [];
  const currentIndex = media.findIndex((m) => m.url === url);
  if (currentIndex === -1) redirect('/dashboard');

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= media.length) redirect('/dashboard');

  const next = [...media];
  const [moved] = next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, moved);
  content.projects[index].media = next;
  await writeContent(content);

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath(`/projects/${id}`);
  redirect('/dashboard');
}

