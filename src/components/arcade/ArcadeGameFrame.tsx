"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Client-side wrapper that loads a static HTML game file in a full-viewport
 * iframe. Provides back-to-arcade navigation and a loading indicator.
 */
export function ArcadeGameFrame({
  src,
  title,
  accent = '#DFFF00',
}: {
  src: string;
  title: string;
  accent?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Lock scroll so the game gets full touch surface
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <main className="h-screen bg-[#030305] text-white flex flex-col overflow-hidden">
      {/* Top bar — single arcade-back button (cool) */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-white/5 shrink-0">
        <Link
          href="/arcade"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md px-4 py-2 border border-white/10 hover:border-[#DFFF00]/40 transition-colors duration-300"
          aria-label="Back to arcade"
        >
          {/* accent glow sweep on hover */}
          <span
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, ${accent}22, transparent 70%)` }}
            aria-hidden="true"
          />
          {/* animated arrow */}
          <span className="relative flex items-center justify-center w-5 h-5">
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-[6px] transition-opacity duration-300"
              style={{ background: accent }}
              aria-hidden="true"
            />
            <svg
              className="relative w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <path d="M10 3 L4 8 L10 13" />
              <path d="M4 8 H13" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </svg>
          </span>
          <span className="relative font-headline text-[10px] tracking-[0.35em] text-white/50 group-hover:text-[#DFFF00] transition-colors duration-300">
            ARCADE
          </span>
        </Link>
        <h1
          className="font-headline text-sm md:text-base tracking-[0.2em] drop-shadow-[0_0_12px_rgba(223,255,0,0.25)]"
          style={{ color: accent }}
        >
          {title}
        </h1>
        {/* spacer to keep title centered */}
        <span className="w-[92px] md:w-[112px] shrink-0" aria-hidden="true" />
      </div>

      {/* Game iframe — absolute fill so it always gets the full remaining height */}
      <div className="relative flex-1 min-h-0">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full border-2 border-white/10 animate-spin"
              style={{ borderTopColor: accent }}
            />
          </div>
        )}
        <iframe
          src={src}
          title={title}
          className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          allow="autoplay; fullscreen; gamepad"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </main>
  );
}
