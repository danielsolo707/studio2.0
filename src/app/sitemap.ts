import { MetadataRoute } from 'next';
import { readContent } from '@/lib/content';

const GAMES: Record<string, string> = {
  snake: 'Snake',
  tetris: 'Tetris',
  pong: 'Pong',
  breakout: 'Breakout',
  'space-invaders': 'Space Invaders',
  'flappy-bird': 'Flappy Bird',
  minesweeper: 'Minesweeper',
};

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

  const arcadePages = Object.keys(GAMES).map((slug) => ({
    url: `${baseUrl}/arcade/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/gateway`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/works/code`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/works/motion`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/arcade`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...arcadePages,
    ...projectPages,
  ];
}
