import type { SiteContent } from '@/types/project';
import { isSupabaseConfigured, supabaseServer, TABLES } from '@/lib/database/supabase';
import {
  supabaseServerReadProjects,
  supabaseServerReadContent,
  supabaseAddProject,
  supabaseUpdateProject,
  supabaseDeleteProject,
  supabaseUpdateHero,
  supabaseUpdateAbout,
  supabaseUpdateOptions,
} from '@/lib/database/supabase-db';

/**
 * Portfolio content is stored in Supabase only.
 * There is no content.json source of truth — that file is intentionally empty.
 */

// Empty shell used only when Supabase is unavailable (local boot without env).
const EMPTY_CONTENT: SiteContent = {
  hero: {
    headline: 'ML ENGINEER\n& AI BUILDER',
    description: 'Applied AI, deep learning, and interactive systems built from experiment to usable product.',
  },
  about: {
    label: 'APPLIED AI',
    headline: 'MODELS MEET\nPRODUCT',
    body: 'I design, evaluate, and ship machine-learning systems: from multimodal models and tool-using agents to reliable web experiences.',
    skills: ['Python', 'PyTorch', 'LLM Agents', 'Deep Learning', 'Next.js', 'Three.js'],
  },
  projects: [],
  options: {
    statuses: ['Case Study', 'Prototype', 'Experiment', 'Learning Project'],
    categories: ['Web App', 'Data Visualization', 'Tool', 'Animation', 'Interactive', 'Experiment'],
    tools: ['React', 'Next.js', 'Python', 'TensorFlow', 'Three.js', 'Blender', 'After Effects', 'Cinema 4D'],
    disciplines: ['Motion', 'Creative Code', 'Data/ML', 'Hybrid'],
    linkTypes: ['GitHub', 'Demo', 'Notebook', 'Video'],
    motion: {
      statuses: ['Case Study', 'Prototype', 'Experiment', 'Showreel'],
      categories: [
        'Logo Animation',
        'Title Sequence',
        'Explainer Video',
        'Motion Graphics',
        'Visual Effects',
        'Brand Film',
        'Music Video',
        'Social Media',
      ],
      tools: ['After Effects', 'Cinema 4D', 'Blender', 'Premiere Pro', 'Illustrator', 'Photoshop', 'Houdini', 'Nuke'],
    },
    code: {
      statuses: ['Case Study', 'Prototype', 'Experiment', 'Learning Project'],
      categories: [
        'Web App',
        'Website',
        'Data Visualization',
        'Tool',
        'Interactive',
        'Game',
        'API/Backend',
        'Machine Learning',
      ],
      tools: [
        'React',
        'Next.js',
        'TypeScript',
        'Python',
        'Node.js',
        'Three.js',
        'TensorFlow',
        'PostgreSQL',
        'MongoDB',
        'Docker',
        'Figma',
      ],
    },
  },
};

function requireSupabase(action: string): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      `Supabase is required to ${action}. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.`,
    );
  }
}

export async function readContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) {
    console.warn('[cms] Supabase not configured — returning empty content shell (no JSON file store).');
    return { ...EMPTY_CONTENT, projects: [] };
  }

  const [content, projects] = await Promise.all([
    supabaseServerReadContent(),
    supabaseServerReadProjects(),
  ]);

  if (content) {
    return { ...content, projects };
  }

  // Tables exist but site_content row missing — still return projects, empty shell for rest
  console.warn('[cms] site_content empty; using empty shell + projects from DB');
  return { ...EMPTY_CONTENT, projects };
}

export async function writeContent(content: SiteContent): Promise<void> {
  requireSupabase('save site content');

  // Only hero/about/options. Projects use add/update/delete helpers.
  await supabaseServer()
    .from(TABLES.SITE_CONTENT)
    .upsert(
      {
        id: 'default',
        hero: content.hero ?? null,
        about: content.about,
        options: content.options ?? {},
      },
      { onConflict: 'id', ignoreDuplicates: false },
    );
}

export async function updateAbout(aboutData: Partial<SiteContent['about']>): Promise<void> {
  requireSupabase('update about');
  await supabaseUpdateAbout(aboutData);
}

export async function updateHero(heroData: {
  headline?: string;
  description?: string;
}): Promise<void> {
  requireSupabase('update hero');
  await supabaseUpdateHero(heroData);
}

export async function addProject(project: SiteContent['projects'][0]): Promise<void> {
  requireSupabase('add project');
  await supabaseAddProject(project);
}

export async function updateProject(
  projectId: string,
  updates: Partial<SiteContent['projects'][0]>,
): Promise<void> {
  requireSupabase('update project');
  await supabaseUpdateProject(projectId, updates);
}

export async function deleteProject(projectId: string): Promise<void> {
  requireSupabase('delete project');
  await supabaseDeleteProject(projectId);
}

export async function getOptions() {
  const content = await readContent();
  return content.options || EMPTY_CONTENT.options;
}

export async function updateOptions(updates: Partial<SiteContent['options']>): Promise<void> {
  requireSupabase('update options');
  await supabaseUpdateOptions(updates);
}

/** @deprecated LocalStorage is no longer used for portfolio content. */
export function clearLocalStorageContent(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('portfolio_content');
  } catch {
    /* ignore */
  }
}

/** @deprecated Always false — portfolio content is Supabase-only. */
export function getUseLocalStorage(): boolean {
  return false;
}
