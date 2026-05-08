import fs from 'fs/promises';
import path from 'path';
import type { SiteContent } from '@/types/project';

// Default content for fallback
const DEFAULT_CONTENT: SiteContent = {
  about: {
    label: 'ABOUT',
    headline: 'CREATIVE DEVELOPER',
    body: 'Building immersive digital experiences with cutting-edge technology.',
    skills: ['REACT', 'NEXT.JS', 'THREE.JS', 'TYPESCRIPT']
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