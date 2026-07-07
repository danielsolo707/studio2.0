import { MetadataRoute } from 'next';
import { readContent } from '@/lib/cms/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.danielsoleimani.ir';
  const content = await readContent();
  const now = new Date();

  const projectPages = content.projects.map((p) => ({
    url: `${baseUrl}/projects/${p.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/works/motion`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/works/code`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arcade`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...projectPages,
  ];
}
