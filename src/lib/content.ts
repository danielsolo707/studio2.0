import fs from 'fs/promises';
import path from 'path';
import type { SiteContent } from '@/types/project';
import { isSupabaseConfigured, supabaseServer, TABLES } from './supabase';
import {
  supabaseServerReadProjects,
  supabaseServerReadContent,
  supabaseAddProject,
  supabaseUpdateProject,
  supabaseDeleteProject,
  supabaseUpdateHero,
  supabaseUpdateAbout,
  supabaseUpdateOptions,
} from './supabase-db';

const LOCAL_STORAGE_KEY = 'portfolio_content';
const USE_LOCAL_STORAGE = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';

function getLocalStorageContent(): SiteContent | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SiteContent;
    }
  } catch (e) {
    console.error('Failed to read localStorage:', e);
  }
  return null;
}

function setLocalStorageContent(content: SiteContent): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(content));
  } catch (e) {
    console.error('Failed to write localStorage:', e);
  }
}

export function clearLocalStorageContent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function getUseLocalStorage(): boolean {
  return USE_LOCAL_STORAGE;
}

// Default content for fallback
const DEFAULT_CONTENT: SiteContent = {
  hero: {
    headline: 'CREATIVE\nDEVELOPER',
    description: 'Creative developer specializing in motion design (After Effects, Cinema 4D) and machine learning. Building interactive web experiences that blend visual storytelling with intelligent systems.'
  },
  about: {
    label: 'ABOUT',
    headline: 'CREATIVE DEVELOPER',
    body: 'Building small visual systems across motion, creative code, and early ML/data experiments.',
    skills: ['AFTER EFFECTS', 'BLENDER', 'REACT', 'NEXT.JS', 'PYTHON', 'DATA VISUALIZATION']
  },
  projects: [
    {
      id: 'default-project',
      name: 'SAMPLE PROJECT',
      year: '2024',
      color: '#DFFF00',
      imageUrl: '',
      videoUrl: '',
      description: 'This is a sample project. Add your own projects through the dashboard.',
      tools: 'VARIOUS',
      category: 'DEVELOPMENT',
      discipline: 'code',
      status: 'prototype',
      role: 'Creative Developer',
      objective: 'Show the purpose of the project and the problem it solves.',
      approach: 'Explain the tools, process, and decisions behind the build.',
      outcome: 'Describe what the project proves or makes possible.',
      nextStep: 'Name the next improvement so the project feels active and honest.',
      links: [],
      media: []
    }
  ],
  options: {
    statuses: ['Case Study', 'Prototype', 'Experiment', 'Learning Project'],
    categories: ['Web App', 'Data Visualization', 'Tool', 'Animation', 'Interactive', 'Experiment'],
    tools: ['React', 'Next.js', 'Python', 'TensorFlow', 'Three.js', 'Blender', 'After Effects', 'Cinema 4D'],
    disciplines: ['Motion', 'Creative Code', 'Data/ML', 'Hybrid'],
    linkTypes: ['GitHub', 'Demo', 'Notebook', 'Video'],
    motion: {
      statuses: ['Case Study', 'Prototype', 'Experiment', 'Showreel'],
      categories: ['Logo Animation', 'Title Sequence', 'Explainer Video', 'Motion Graphics', 'Visual Effects', 'Brand Film', 'Music Video', 'Social Media'],
      tools: ['After Effects', 'Cinema 4D', 'Blender', 'Premiere Pro', 'Illustrator', 'Photoshop', 'Houdini', 'Nuke']
    },
    code: {
      statuses: ['Case Study', 'Prototype', 'Experiment', 'Learning Project'],
      categories: ['Web App', 'Website', 'Data Visualization', 'Tool', 'Interactive', 'Game', 'API/Backend', 'Machine Learning'],
      tools: ['React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Three.js', 'TensorFlow', 'PostgreSQL', 'MongoDB', 'Docker', 'Figma']
    }
  }
};

export async function readContent(): Promise<SiteContent> {
  if (isSupabaseConfigured) {
    const [content, projects] = await Promise.all([
      supabaseServerReadContent(),
      supabaseServerReadProjects(),
    ]);
    if (content) {
      return { ...content, projects };
    }
    console.warn('Supabase read returned null, falling back to file');
  }

  if (USE_LOCAL_STORAGE) {
    const localData = getLocalStorageContent();
    if (localData) {
      return localData;
    }
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'content.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const content = JSON.parse(fileContents) as SiteContent;
    
    if (!content.about || !content.projects) {
      console.warn('Invalid content structure, using defaults');
      return DEFAULT_CONTENT;
    }
    
    if (USE_LOCAL_STORAGE) {
      setLocalStorageContent(content);
    }
    
    return content;
  } catch (error) {
    console.error('Failed to read content file:', error);
    
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'content.json');
      await fs.writeFile(filePath, JSON.stringify(DEFAULT_CONTENT, null, 2));
      console.log('Created default content file');
      if (USE_LOCAL_STORAGE) {
        setLocalStorageContent(DEFAULT_CONTENT);
      }
      return DEFAULT_CONTENT;
    } catch (writeError) {
      console.error('Failed to create default content file:', writeError);
      return DEFAULT_CONTENT;
    }
  }
}

export async function writeContent(content: SiteContent): Promise<void> {
  if (isSupabaseConfigured) {
    // Only persist hero/about/options here. Projects are written through the
    // targeted helpers (addProject / updateProject / deleteProject) so a stale
    // or partial read can never trigger a destructive full-list reconcile.
    await supabaseServer()
      .from(TABLES.SITE_CONTENT)
      .upsert({
        id: 'default',
        hero: content.hero ?? null,
        about: content.about,
        options: content.options ?? {},
      }, { onConflict: 'id', ignoreDuplicates: false });

    return;
  }

  if (USE_LOCAL_STORAGE) {
    setLocalStorageContent(content);
  }
  
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'content.json');
    await fs.writeFile(filePath, JSON.stringify(content, null, 2));
  } catch (error) {
    if (!USE_LOCAL_STORAGE) {
      console.error('Failed to write content file:', error);
      throw new Error('Failed to save content');
    }
  }
}

// Helper functions for content manipulation
export async function updateAbout(aboutData: Partial<SiteContent['about']>): Promise<void> {
  if (isSupabaseConfigured) {
    await supabaseUpdateAbout(aboutData);
    return;
  }
  const content = await readContent();
  content.about = { ...content.about, ...aboutData };
  await writeContent(content);
}

export async function updateHero(heroData: { headline?: string; description?: string }): Promise<void> {
  if (isSupabaseConfigured) {
    await supabaseUpdateHero(heroData);
    return;
  }
  const content = await readContent();
  content.hero = {
    headline: content.hero?.headline || '',
    description: content.hero?.description || '',
    ...heroData,
  };
  await writeContent(content);
}

export async function addProject(project: SiteContent['projects'][0]): Promise<void> {
  if (isSupabaseConfigured) {
    await supabaseAddProject(project);
    return;
  }
  const content = await readContent();
  content.projects.push(project);
  await writeContent(content);
}

export async function updateProject(projectId: string, updates: Partial<SiteContent['projects'][0]>): Promise<void> {
  if (isSupabaseConfigured) {
    await supabaseUpdateProject(projectId, updates);
    return;
  }
  const content = await readContent();
  const projectIndex = content.projects.findIndex((p: SiteContent['projects'][0]) => p.id === projectId);
  
  if (projectIndex !== -1) {
    content.projects[projectIndex] = { ...content.projects[projectIndex], ...updates };
    await writeContent(content);
  } else {
    throw new Error(`Project with id ${projectId} not found`);
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabaseDeleteProject(projectId);
    return;
  }
  const content = await readContent();
  content.projects = content.projects.filter((p: SiteContent['projects'][0]) => p.id !== projectId);
  await writeContent(content);
}

export async function getOptions() {
  const content = await readContent();
  return content.options || DEFAULT_CONTENT.options;
}

export async function updateOptions(updates: Partial<SiteContent['options']>): Promise<void> {
  if (isSupabaseConfigured) {
    await supabaseUpdateOptions(updates);
    return;
  }
  const content = await readContent();
  content.options = {
    ...DEFAULT_CONTENT.options,
    ...content.options,
    ...updates
  };
  await writeContent(content);
}
