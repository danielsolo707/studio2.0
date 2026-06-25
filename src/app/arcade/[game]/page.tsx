import { notFound } from 'next/navigation';
import { ArcadeGameFrame } from '@/components/arcade/ArcadeGameFrame';

// Static map of valid HTML game slugs → metadata
const GAMES: Record<string, { src: string; title: string; accent: string }> = {
  snake:           { src: '/arcade/snake.html',              title: 'Snake',           accent: '#DFFF00' },
  tetris:          { src: '/arcade/tetris.html',             title: 'Tetris',          accent: '#ff9f43' },
  pong:            { src: '/arcade/pong/index.html',         title: 'Pong',            accent: '#22d3ee' },
  breakout:        { src: '/arcade/breakout.html',           title: 'Breakout',        accent: '#a855f7' },
  'space-invaders':{ src: '/arcade/space-invaders.html',     title: 'Space Invaders',  accent: '#f97316' },
  'flappy-bird':   { src: '/arcade/flappy-bird/index.html',  title: 'Flappy Bird',     accent: '#10b981' },
  minesweeper:     { src: '/arcade/minesweeper.html',        title: 'Minesweeper',     accent: '#6366f1' },
};

export function generateStaticParams() {
  return Object.keys(GAMES).map((game) => ({ game }));
}

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  const g = GAMES[game];
  if (!g) return { robots: { index: false, follow: false } };
  return { title: `${g.title} — Arcade`, robots: { index: false, follow: false } };
}

export default async function ArcadeGamePage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  const g = GAMES[game];
  if (!g) notFound();

  return <ArcadeGameFrame src={g.src} title={g.title} accent={g.accent} />;
}
