"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GameThumbnail } from '@/components/arcade/GameThumbnail';

type Game = {
  slug: string;
  href: string;
  title: string;
  description: string;
  year: string;
  accent: string;
  tags: string[];
};

const GAMES: Game[] = [
  { slug: '2048',           href: '/arcade/2048',           title: '2048',          description: 'Slide tiles, merge doubles, reach 2048.',     year: '2014', accent: '#ff9f43', tags: ['PUZZLE', 'SOLO'] },
  { slug: 'snake',          href: '/arcade/snake',          title: 'Snake',         description: 'Eat, grow, don\'t bite yourself. The eternal.', year: '1976', accent: '#DFFF00', tags: ['ARCADE', 'CLASSIC'] },
  { slug: 'tetris',         href: '/arcade/tetris',         title: 'Tetris',        description: 'Stack falling blocks. Clear lines. Repeat.',  year: '1984', accent: '#ff9f43', tags: ['PUZZLE', 'CLASSIC'] },
  { slug: 'pong',           href: '/arcade/pong',           title: 'Pong',          description: 'The original. Paddle, ball, reflexes.',        year: '1972', accent: '#22d3ee', tags: ['ARCADE', '1P vs CPU'] },
  { slug: 'breakout',       href: '/arcade/breakout',       title: 'Breakout',      description: 'Bounce the ball, smash every brick.',         year: '1976', accent: '#a855f7', tags: ['ARCADE', 'CLASSIC'] },
  { slug: 'space-invaders', href: '/arcade/space-invaders', title: 'Space Invaders',description: 'Defend Earth. Shoot the alien grid.',          year: '1978', accent: '#f97316', tags: ['SHOOTER', 'ARCADE'] },
  { slug: 'flappy-bird',    href: '/arcade/flappy-bird',    title: 'Flappy Bird',   description: 'Tap to flap. Dodge pipes. Suffer.',            year: '2013', accent: '#10b981', tags: ['ARCADE', 'RAGE'] },
  { slug: 'minesweeper',    href: '/arcade/minesweeper',    title: 'Minesweeper',   description: 'Logic, flags, and hidden mines.',              year: '1989', accent: '#6366f1', tags: ['PUZZLE', 'LOGIC'] },
];

export default function ArcadePage() {
  return (
    <main className="min-h-screen bg-[#030305] text-white overflow-x-hidden">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 20% 10%, rgba(223,255,0,0.07), transparent 45%),' +
            'radial-gradient(circle at 80% 90%, rgba(168,85,247,0.06), transparent 50%),' +
            'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.04), transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 px-4 py-8 md:px-8 md:py-12 lg:px-12 max-w-7xl mx-auto">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12 flex items-start justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#ff9f43] animate-pulse" />
              <p className="font-headline text-[10px] tracking-[0.5em] text-[#ff9f43] uppercase">
                Hidden Arcade
              </p>
            </div>
            <h1 className="font-headline text-[clamp(2.5rem,7vw,5rem)] tracking-[-0.03em] leading-[0.9] text-white">
              ARCADE
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/50 max-w-md font-body leading-relaxed">
              Eight nostalgic games. Built with vanilla HTML5 canvas — no frameworks, no installs.
              Press play and travel back.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-2 text-xs font-headline tracking-[0.3em] text-white/50 hover:text-[#DFFF00] transition-colors border border-white/10 hover:border-[#DFFF00]/30 px-4 py-2.5 rounded-full"
            aria-label="Back to home"
          >
            ← HOME
          </Link>
        </motion.div>

        {/* ─── Game grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </div>

        {/* ─── Footer note ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3"
        >
          <p className="text-[10px] font-headline tracking-[0.3em] text-white/30 uppercase">
            8 Games · HTML5 · No frameworks
          </p>
          <p className="text-[10px] font-headline tracking-[0.3em] text-white/30 uppercase">
            Keyboard + Touch Supported
          </p>
        </motion.div>
      </div>
    </main>
  );
}

/* ─── Individual game card ─── */
function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={game.href}
      className="group relative block overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all duration-400 hover:bg-white/[0.04]"
      aria-label={`Play ${game.title}`}
    >
      {/* Accent glow on hover */}
      <div
        className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${game.accent}20, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden border-b border-white/5 bg-[#060608]">
        <div
          className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${game.accent}15, transparent 65%)`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 p-4 transition-transform duration-500 group-hover:scale-105">
          <GameThumbnail game={game.slug} />
        </div>
        {/* Year badge */}
        <span
          className="absolute top-3 right-3 font-headline text-[8px] tracking-[0.2em] px-2 py-1 rounded-full border"
          style={{ borderColor: `${game.accent}40`, color: game.accent, background: `${game.accent}10` }}
        >
          {game.year}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="font-headline text-lg md:text-xl tracking-tight text-white group-hover:text-[#DFFF00] transition-colors duration-300">
            {game.title}
          </h2>
          <span
            className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-150"
            style={{ background: game.accent }}
            aria-hidden="true"
          />
        </div>
        <p className="text-xs text-white/45 leading-relaxed mb-3 min-h-[2.5em]">
          {game.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="text-[7px] font-headline tracking-[0.15em] px-1.5 py-0.5 rounded border border-white/10 text-white/40"
              >
                {tag}
              </span>
            ))}
          </div>
          <span
            className="font-headline text-[9px] tracking-[0.25em] transition-all duration-300 group-hover:tracking-[0.35em]"
            style={{ color: game.accent }}
          >
            PLAY →
          </span>
        </div>
      </div>
    </Link>
  );
}
