import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readContent } from '@/lib/cms/content';
import { DISCIPLINE_LABELS, getProjectDiscipline } from '@/lib/cms/project-meta';
import { ProjectDetailClient } from '@/components/project/detail/ProjectDetailClient';
import { cache } from 'react';

export const revalidate = 3600;

const getProject = cache(async (slug: string) => {
  const content = await readContent();
  return content.projects.find((project) => project.id === slug);
});

export async function generateStaticParams() {
  const content = await readContent();
  return content.projects.map((project) => ({ slug: project.id }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

/** Per-project metadata for SEO & social sharing */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project Not Found' };
  const discipline = DISCIPLINE_LABELS[getProjectDiscipline(project)];

  return {
    title: project.name,
    description: `${discipline} — ${project.description}`,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.name,
      description: `${discipline} — ${project.description}`,
      images: project.imageUrl ? [{ url: project.imageUrl, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  return <ProjectDetailClient project={project} />;
}
