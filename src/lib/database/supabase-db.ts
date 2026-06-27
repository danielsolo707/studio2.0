import crypto from 'crypto';
import { supabaseServer, supabaseBrowser, isSupabaseConfigured, TABLES, BUCKETS } from './supabase';
import type { SiteContent, Project, ProjectDiscipline, ProjectStatus } from '@/types/project';
import type { StoredMessage, MessageReply } from '@/lib/contact/contact-log';

// ─── Helpers ────────────────────────────────────────────

function mapProjectFromDB(row: any): Project {
  return {
    id: row.id ?? crypto.randomUUID(),
    name: row.name,
    year: row.year,
    color: row.color,
    imageUrl: row.image_url ?? '',
    videoUrl: row.video_url ?? undefined,
    description: row.description,
    subtitle: row.subtitle ?? undefined,
    details: row.details ?? undefined,
    tools: row.tools ?? '',
    category: row.category ?? '',
    discipline: row.discipline as ProjectDiscipline | undefined,
    status: row.status as ProjectStatus | undefined,
    role: row.role ?? undefined,
    objective: row.objective ?? undefined,
    approach: row.approach ?? undefined,
    outcome: row.outcome ?? undefined,
    nextStep: row.next_step ?? undefined,
    challenge: row.challenge ?? undefined,
    solution: row.solution ?? undefined,
    links: row.links ?? [],
    media: row.media ?? [],
  };
}

export function mapProjectToDB(project: Project): any {
  return {
    id: project.id,
    name: project.name,
    year: project.year,
    color: project.color,
    image_url: project.imageUrl,
    video_url: project.videoUrl ?? null,
    description: project.description,
    subtitle: project.subtitle ?? null,
    details: project.details ?? null,
    tools: project.tools,
    category: project.category,
    discipline: project.discipline ?? null,
    status: project.status ?? null,
    role: project.role ?? null,
    objective: project.objective ?? null,
    approach: project.approach ?? null,
    outcome: project.outcome ?? null,
    next_step: project.nextStep ?? null,
    challenge: project.challenge ?? null,
    solution: project.solution ?? null,
    links: project.links ?? [],
    media: project.media ?? [],
  };
}

// ─── Projects ───────────────────────────────────────────

export async function supabaseReadProjects(): Promise<Project[]> {
  const { data, error } = await supabaseBrowser()
    .from(TABLES.PROJECTS)
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error reading projects:', JSON.stringify(error), error?.message || '');
    return [];
  }
  return (data ?? []).map(mapProjectFromDB);
}

export async function supabaseServerReadProjects(): Promise<Project[]> {
  const { data, error } = await supabaseServer()
    .from(TABLES.PROJECTS)
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error reading projects (server):', JSON.stringify(error), error?.message || '');
    return [];
  }
  return (data ?? []).map(mapProjectFromDB);
}

export async function supabaseAddProject(project: Project): Promise<void> {
  const { error } = await supabaseServer()
    .from(TABLES.PROJECTS)
    .insert(mapProjectToDB(project));

  if (error) throw new Error(`Failed to add project: ${error.message}`);
}

export async function supabaseUpdateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.year !== undefined) dbUpdates.year = updates.year;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl ?? null;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle ?? null;
  if (updates.details !== undefined) dbUpdates.details = updates.details ?? null;
  if (updates.tools !== undefined) dbUpdates.tools = updates.tools;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.discipline !== undefined) dbUpdates.discipline = updates.discipline ?? null;
  if (updates.status !== undefined) dbUpdates.status = updates.status ?? null;
  if (updates.role !== undefined) dbUpdates.role = updates.role ?? null;
  if (updates.objective !== undefined) dbUpdates.objective = updates.objective ?? null;
  if (updates.approach !== undefined) dbUpdates.approach = updates.approach ?? null;
  if (updates.outcome !== undefined) dbUpdates.outcome = updates.outcome ?? null;
  if (updates.nextStep !== undefined) dbUpdates.next_step = updates.nextStep ?? null;
  if (updates.challenge !== undefined) dbUpdates.challenge = updates.challenge ?? null;
  if (updates.solution !== undefined) dbUpdates.solution = updates.solution ?? null;
  if (updates.links !== undefined) dbUpdates.links = updates.links;
  if (updates.media !== undefined) dbUpdates.media = updates.media;

  const { error } = await supabaseServer()
    .from(TABLES.PROJECTS)
    .update(dbUpdates)
    .eq('id', projectId);

  if (error) throw new Error(`Failed to update project: ${error.message}`);
}

export async function supabaseDeleteProject(projectId: string): Promise<void> {
  const { error } = await supabaseServer()
    .from(TABLES.PROJECTS)
    .delete()
    .eq('id', projectId);

  if (error) throw new Error(`Failed to delete project: ${error.message}`);
}

// ─── Site Content ───────────────────────────────────────

export async function supabaseReadContent(): Promise<SiteContent | null> {
  const { data, error } = await supabaseBrowser()
    .from(TABLES.SITE_CONTENT)
    .select('*')
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    hero: data.hero ?? undefined,
    about: data.about,
    projects: [], // projects are fetched separately
    options: data.options ?? undefined,
  };
}

export async function supabaseServerReadContent(): Promise<SiteContent | null> {
  const { data, error } = await supabaseServer()
    .from(TABLES.SITE_CONTENT)
    .select('*')
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    hero: data.hero ?? undefined,
    about: data.about,
    projects: [],
    options: data.options ?? undefined,
  };
}

export async function supabaseUpdateHero(
  heroData: { headline?: string; description?: string },
): Promise<void> {
  const existing = await supabaseServerReadContent();

  const hero = {
    headline: heroData.headline ?? existing?.hero?.headline ?? '',
    description: heroData.description ?? existing?.hero?.description ?? '',
  };

  const { error } = await supabaseServer()
    .from(TABLES.SITE_CONTENT)
    .upsert({ id: 'default', hero }, { onConflict: 'id' });

  if (error) throw new Error(`Failed to update hero: ${error.message}`);
}

export async function supabaseUpdateAbout(
  aboutData: Partial<SiteContent['about']>,
): Promise<void> {
  const existing = await supabaseServerReadContent();
  const about = {
    label: aboutData.label ?? existing?.about?.label ?? 'ABOUT',
    headline: aboutData.headline ?? existing?.about?.headline ?? '',
    body: aboutData.body ?? existing?.about?.body ?? '',
    skills: aboutData.skills ?? existing?.about?.skills ?? [],
  };

  const { error } = await supabaseServer()
    .from(TABLES.SITE_CONTENT)
    .upsert({ id: 'default', about }, { onConflict: 'id' });

  if (error) throw new Error(`Failed to update about: ${error.message}`);
}

export async function supabaseUpdateOptions(
  optionsData: Partial<SiteContent['options']>,
): Promise<void> {
  const existing = await supabaseServerReadContent();
  const options = { ...(existing?.options ?? {}), ...optionsData };

  const { error } = await supabaseServer()
    .from(TABLES.SITE_CONTENT)
    .upsert({ id: 'default', options }, { onConflict: 'id' });

  if (error) throw new Error(`Failed to update options: ${error.message}`);
}

// ─── Contact Messages ───────────────────────────────────

function mapMessageFromDB(row: any): StoredMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    receivedAt: row.received_at,
    isRead: row.is_read,
    archived: row.archived,
    replies: row.replies ?? [],
  };
}

export async function supabaseAddMessage(entry: {
  name: string;
  email: string;
  message: string;
}): Promise<StoredMessage> {
  const { data, error } = await supabaseBrowser()
    .from(TABLES.CONTACT_MESSAGES)
    .insert({
      name: entry.name,
      email: entry.email,
      message: entry.message,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add message: ${error.message}`);
  return mapMessageFromDB(data);
}

export async function supabaseListMessages(limit = 100): Promise<StoredMessage[]> {
  const { data, error } = await supabaseServer()
    .from(TABLES.CONTACT_MESSAGES)
    .select('*')
    .order('received_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error listing messages:', error);
    return [];
  }
  return (data ?? []).map(mapMessageFromDB);
}

export async function supabaseUpdateMessage(
  id: string,
  updates: Partial<Pick<StoredMessage, 'isRead' | 'archived'>>,
): Promise<StoredMessage | null> {
  const dbUpdates: any = {};
  if (updates.isRead !== undefined) dbUpdates.is_read = updates.isRead;
  if (updates.archived !== undefined) dbUpdates.archived = updates.archived;

  const { data, error } = await supabaseServer()
    .from(TABLES.CONTACT_MESSAGES)
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return mapMessageFromDB(data);
}

export async function supabaseAppendReply(
  id: string,
  reply: MessageReply,
): Promise<void> {
  const existing = await supabaseServer()
    .from(TABLES.CONTACT_MESSAGES)
    .select('replies')
    .eq('id', id)
    .single();

  const replies = [...(existing.data?.replies ?? []), reply];

  const { error } = await supabaseServer()
    .from(TABLES.CONTACT_MESSAGES)
    .update({ replies, is_read: true })
    .eq('id', id);

  if (error) throw new Error(`Failed to append reply: ${error.message}`);
}

export async function supabaseDeleteMessage(id: string): Promise<void> {
  const { error } = await supabaseServer()
    .from(TABLES.CONTACT_MESSAGES)
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete message: ${error.message}`);
}

export async function supabaseBulkDeleteMessages(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabaseServer()
    .from(TABLES.CONTACT_MESSAGES)
    .delete()
    .in('id', ids);

  if (error) throw new Error(`Failed to bulk delete messages: ${error.message}`);
}

// ─── File Upload Helper ─────────────────────────────────

export async function supabaseUploadFile(
  bucket: keyof typeof BUCKETS,
  filePath: string,
  file: File | Blob,
): Promise<string> {
  const { data, error } = await supabaseServer()
    .storage
    .from(BUCKETS[bucket])
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw new Error(`Failed to upload file: ${error.message}`);

  const { data: urlData } = await supabaseServer()
    .storage
    .from(BUCKETS[bucket])
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function supabaseDeleteFile(bucket: keyof typeof BUCKETS, filePath: string): Promise<void> {
  const { error } = await supabaseServer()
    .storage
    .from(BUCKETS[bucket])
    .remove([filePath]);

  if (error) console.error('Error deleting file:', error);
}

export async function supabaseListFiles(bucket: keyof typeof BUCKETS, folder?: string) {
  const { data, error } = await supabaseServer()
    .storage
    .from(BUCKETS[bucket])
    .list(folder);

  if (error) {
    console.error('Error listing files:', error);
    return [];
  }
  return data;
}