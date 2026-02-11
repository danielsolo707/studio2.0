import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readContent } from '@/lib/content';
import { ProjectDetailClient } from './ProjectDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

/** Per-project metadata for SEO & social sharing */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await readContent();
  const project = content.projects.find((p) => p.id === slug);
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.name} | MotionVerse`,
    description: project.description,
    openGraph: {
      title: `${project.name} | MotionVerse`,
      description: project.description,
      images: [{ url: project.imageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const content = await readContent();
  const project = content.projects.find((p) => p.id === slug);

  if (!project) notFound();

  return <ProjectDetailClient project={project} />;
}
