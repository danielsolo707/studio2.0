"use server"

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { deleteGridFsFile } from '@/lib/gridfs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { clearSession, getSession, setSession } from '@/lib/auth';
import { readContent, writeContent } from '@/lib/content';
import { is2FAEnabled, readTotpConfig, verifyTotpToken } from '@/lib/totp';
import { isCaptchaEnabled } from '@/lib/captcha-config';
import type { Project, ProjectLink } from '@/types/project';
import { listMessages, updateMessage, deleteMessage, bulkDelete, appendReply } from '@/lib/contact-log';

type ActionState = { error?: string; success?: boolean };

type TurnstileVerifyResponse = {
  success: boolean;
  'error-codes'?: string[];
};

async function verifyTurnstile(token: string): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: false, error: 'Turnstile secret key is not configured' };
  }

  if (!token) {
    return { ok: false, error: 'Missing CAPTCHA verification' };
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: 'CAPTCHA verification failed' };
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    if (!data.success) {
      return { ok: false, error: 'CAPTCHA verification failed' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'CAPTCHA verification failed' };
  }
}

function getAdminCreds(): { user: string; pass: string | null } {
  const user = process.env.ADMIN_USERNAME || 'admin';
  const pass = process.env.ADMIN_PASSWORD;
  if (pass) return { user, pass };
  if (process.env.NODE_ENV === 'production') return { user, pass: null };
  return { user, pass: 'change-me' };
}

/* ─── Zod schemas ─── */
const aboutSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  headline: z.string().min(1, 'Headline is required'),
  body: z.string().min(1, 'Body is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

const heroSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  description: z.string().min(1, 'Description is required'),
});

const projectSchema = z.object({
  id: z.string().min(1, 'ID is required').regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1, 'Name is required'),
  subtitle: z.string().optional().default(''),
  details: z.string().optional().default(''),
  year: z.string().min(4, 'Year is required'),
  color: z.string().optional().default('#DFFF00'),
  imageUrl: z.string(),
  videoUrl: z.string().optional().default(''),
  description: z.string().min(1, 'Description is required'),
  tools: z.string().min(1, 'Tools are required'),
  category: z.string().min(1, 'Category is required'),
  discipline: z.enum(['motion', 'code', 'data', 'hybrid']).default('motion'),
  status: z.enum(['case-study', 'prototype', 'experiment', 'learning-project', 'showreel']).default('case-study'),
  role: z.string().optional().default(''),
  objective: z.string().optional().default(''),
  approach: z.string().optional().default(''),
  outcome: z.string().optional().default(''),
  nextStep: z.string().optional().default(''),
  challenge: z.string().optional().default(''),
  solution: z.string().optional().default(''),
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
  const admin = getAdminCreds();
  if (!admin.pass) {
    return { error: 'Admin credentials are not configured' };
  }

  const user = String(formData.get('username') || '').trim();
  const pass = String(formData.get('password') || '').trim();
  const captchaEnabled = await isCaptchaEnabled();
  if (captchaEnabled) {
    const turnstileToken = String(formData.get('cf-turnstile-response') || '').trim();
    const captchaResult = await verifyTurnstile(turnstileToken);
    if (!captchaResult.ok) {
      return { error: captchaResult.error || 'CAPTCHA verification failed' };
    }
  }

  if (user !== admin.user || pass !== admin.pass) {
    return { error: 'Invalid username or password' };
  }

  const twoFAEnabled = await is2FAEnabled();
  if (twoFAEnabled) {
    return { needs2FA: true };
  }

  await setSession(admin.user);
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
    await setSession(getAdminCreds().user);
    redirect('/dashboard');
  }

  const isValid = verifyTotpToken(config.secret, token);
  if (!isValid) {
    return { error: 'Invalid code. Please try again.' };
  }

  await setSession(getAdminCreds().user);
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

export async function updateAboutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
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
    return { error: result.error.errors[0]?.message ?? 'Invalid input' };
  }

  const content = await readContent();
  content.about = { label, headline, body, skills };
  await writeContent(content);

  revalidatePath('/');
  return { error: undefined };
}

export async function updateHeroAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  const headline = String(formData.get('headline') || '').trim();
  const description = String(formData.get('description') || '').trim();

  const result = heroSchema.safeParse({ headline, description });
  if (!result.success) {
    return { error: result.error.errors[0]?.message ?? 'Invalid input' };
  }

  const content = await readContent();
  content.hero = { headline, description };
  await writeContent(content);

  revalidatePath('/');
  return { error: undefined };
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
    discipline: String(formData.get('discipline') || existing?.discipline || 'motion').trim(),
    status: String(formData.get('status') || existing?.status || 'case-study').trim(),
    role: String(formData.get('role') || existing?.role || '').trim(),
    objective: String(formData.get('objective') || existing?.objective || '').trim(),
    approach: String(formData.get('approach') || existing?.approach || '').trim(),
    outcome: String(formData.get('outcome') || existing?.outcome || '').trim(),
    nextStep: String(formData.get('nextStep') || existing?.nextStep || '').trim(),
    challenge: String(formData.get('challenge') || existing?.challenge || '').trim(),
    solution: String(formData.get('solution') || existing?.solution || '').trim(),
  };

  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0]?.message ?? 'Invalid project data' };
  }

  const links: ProjectLink[] = [];
  for (let i = 0; i < 3; i += 1) {
    const label = String(formData.get(`linkLabel${i}`) || '').trim();
    const url = String(formData.get(`linkUrl${i}`) || '').trim();
    const type = String(formData.get(`linkType${i}`) || 'demo').trim();

    if (!label && !url) continue;
    if (!label || !url) {
      return { error: 'Project links need both label and URL' };
    }

    const parsedLink = z.object({
      label: z.string().min(1),
      url: z.string().url('Project link must be a valid URL'),
      type: z.enum(['github', 'demo', 'notebook', 'video']),
    }).safeParse({ label, url, type });

    if (!parsedLink.success) {
      return { error: parsedLink.error.errors[0]?.message ?? 'Invalid project link' };
    }

    links.push(parsedLink.data);
  }

  return {
    data: {
      ...result.data,
      videoUrl: result.data.videoUrl ?? '',
      role: result.data.role || result.data.category,
      links,
      media: existing?.media || [],
    },
  };
}

export async function addProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  const { data: project, error } = coerceProject(formData);

  if (error || !project) {
    return { error: error ?? 'Invalid project data' };
  }

  const content = await readContent();

  if (content.projects.some((p) => p.id === project.id)) {
    return { error: 'Project ID already exists' };
  }

  content.projects.push(project);
  await writeContent(content);

  revalidatePath('/');
  revalidatePath('/projects');
  return { error: undefined };
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

  if (fileId) await deleteGridFsFile(fileId);
  if (thumbFileId) await deleteGridFsFile(thumbFileId);

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

export async function updateOptionsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const updates: Record<string, string[]> = {}
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        try {
          updates[key] = JSON.parse(value)
        } catch {
          // Skip non-JSON values
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return { error: 'No valid options provided' };
    }

    const { updateOptions } = await import('@/lib/content')
    await updateOptions(updates)

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to update options:', error)
    return { error: 'Failed to update options' }
  }
}

