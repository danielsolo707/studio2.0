export type ProjectDiscipline = 'motion' | 'code' | 'data' | 'hybrid';

export type ProjectStatus =
  | 'case-study'
  | 'prototype'
  | 'experiment'
  | 'learning-project'
  | 'showreel';

export type ProjectLinkType = 'github' | 'demo' | 'notebook' | 'video';

export interface ProjectLink {
  label: string;
  url: string;
  type: ProjectLinkType;
}

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
  discipline?: ProjectDiscipline;
  status?: ProjectStatus;
  role?: string;
  objective?: string;
  approach?: string;
  outcome?: string;
  nextStep?: string;
  links?: ProjectLink[];
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

export interface HeroSection {
  headline: string;
  description: string;
}

export interface SiteContent {
  hero?: HeroSection;
  about: AboutSection;
  projects: Project[];
  options?: {
    statuses?: string[];
    categories?: string[];
    tools?: string[];
    disciplines?: string[];
    linkTypes?: string[];
    motion?: {
      statuses?: string[];
      categories?: string[];
      tools?: string[];
    };
    code?: {
      statuses?: string[];
      categories?: string[];
      tools?: string[];
    };
  };
}
