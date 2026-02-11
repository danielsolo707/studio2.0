import { MetadataRoute } from 'next';
import { readContent } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await readContent();
  const projectPages = content.projects.map((p) => ({
    url: `https://motionverse.design/projects/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://motionverse.design',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...projectPages,
  ];
}
