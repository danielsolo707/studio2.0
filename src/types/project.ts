export interface Project {
  id: string;
  name: string;
  year: string;
  color: string;
  imageUrl: string;
  videoUrl?: string;
  description: string;
  tools: string;
  category: string;
  media: Array<{
    type: 'image' | 'video';
    url: string;
    fileId?: string;
    storage?: string;
    thumbFileId?: string;
    thumbUrl?: string;
  }>;
}

export interface AboutSection {
  label: string;
  headline: string;
  body: string;
  skills: string[];
}

export interface SiteContent {
  about: AboutSection;
  projects: Project[];
}