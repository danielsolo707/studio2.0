import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.danielsoleimani.ir';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/dashboard/'],
      },
      {
        userAgent: '*',
        allow: '/arcade/',
        disallow: [
          '/arcade/snake',
          '/arcade/tetris',
          '/arcade/pong',
          '/arcade/breakout',
          '/arcade/space-invaders',
          '/arcade/flappy-bird',
          '/arcade/minesweeper',
          '/arcade/2048',
          '/arcade/synesthesia',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
