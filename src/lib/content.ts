import fs from 'fs/promises';
import path from 'path';
import type { SiteContent } from '@/types/project';

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
  ]
};

export async function readContent(): Promise<SiteContent> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'content.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const content = JSON.parse(fileContents) as SiteContent;
    
    // Validate content structure
    if (!content.about || !content.projects) {
      console.warn('Invalid content structure, using defaults');
      return DEFAULT_CONTENT;
    }
    
    return content;
  } catch (error) {
    console.error('Failed to read content file:', error);
    
    // Try to create default content file if it doesn't exist
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'content.json');
      await fs.writeFile(filePath, JSON.stringify(DEFAULT_CONTENT, null, 2));
      console.log('Created default content file');
      return DEFAULT_CONTENT;
    } catch (writeError) {
      console.error('Failed to create default content file:', writeError);
      return DEFAULT_CONTENT;
    }
  }
}

export async function writeContent(content: SiteContent): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'content.json');
    await fs.writeFile(filePath, JSON.stringify(content, null, 2));
  } catch (error) {
    console.error('Failed to write content file:', error);
    throw new Error('Failed to save content');
  }
}

// Helper functions for content manipulation
export async function updateAbout(aboutData: Partial<SiteContent['about']>): Promise<void> {
  const content = await readContent();
  content.about = { ...content.about, ...aboutData };
  await writeContent(content);
}

export async function updateHero(heroData: Partial<SiteContent['hero']>): Promise<void> {
  const content = await readContent();
  content.hero = {
    headline: content.hero?.headline || '',
    description: content.hero?.description || '',
    ...heroData,
  };
  await writeContent(content);
}

export async function addProject(project: SiteContent['projects'][0]): Promise<void> {
  const content = await readContent();
  content.projects.push(project);
  await writeContent(content);
}

export async function updateProject(projectId: string, updates: Partial<SiteContent['projects'][0]>): Promise<void> {
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
  const content = await readContent();
  content.projects = content.projects.filter((p: SiteContent['projects'][0]) => p.id !== projectId);
  await writeContent(content);
}
