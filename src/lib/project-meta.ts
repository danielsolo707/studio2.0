import type {
  Project,
  ProjectDiscipline,
  ProjectLinkType,
  ProjectStatus,
} from '@/types/project';

export const DISCIPLINE_LABELS: Record<ProjectDiscipline, string> = {
  motion: 'Motion',
  code: 'Creative Code',
  data: 'Data/ML',
  hybrid: 'Hybrid',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  'case-study': 'Case Study',
  prototype: 'Prototype',
  experiment: 'Experiment',
  'learning-project': 'Learning Project',
};

export const LINK_TYPE_LABELS: Record<ProjectLinkType, string> = {
  github: 'GitHub',
  demo: 'Demo',
  notebook: 'Notebook',
  video: 'Video',
};

export const DISCIPLINE_OPTIONS = Object.keys(DISCIPLINE_LABELS) as ProjectDiscipline[];
export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as ProjectStatus[];
export const LINK_TYPE_OPTIONS = Object.keys(LINK_TYPE_LABELS) as ProjectLinkType[];

export function getProjectDiscipline(project: Project): ProjectDiscipline {
  return project.discipline ?? 'motion';
}

export function getProjectStatus(project: Project): ProjectStatus {
  return project.status ?? 'case-study';
}

export function getProjectRole(project: Project): string {
  return project.role?.trim() || project.category;
}

export function getProjectLinks(project: Project) {
  return project.links ?? [];
}
