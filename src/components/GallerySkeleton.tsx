"use client";

import clsx from 'clsx';

type Props = {
  items?: number;
  className?: string;
  shimmer?: boolean;
};

export function GallerySkeleton({ items = 6, className, shimmer = true }: Props) {
  const cards = Array.from({ length: items });

  return (
    <div
      role="presentation"
      className={clsx('grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8', className)}
      aria-hidden="true"
    >
      {cards.map((_, idx) => (
        <div
          key={idx}
          className={clsx(
            'relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden',
            'shadow-[0_10px_40px_rgba(0,0,0,0.35)]',
            'ring-0 hover:ring-1 hover:ring-[#dfff00]/20 hover:shadow-[0_0_30px_rgba(223,255,0,0.25)]',
            shimmer ? 'skeleton-shimmer' : 'animate-pulse',
          )}
        >
          <div className="aspect-video w-full bg-[#1e1e1e]" />
          <div className="px-5 pb-5">
            <div className="h-3 rounded-full w-3/4 bg-white/10 mt-4" />
            <div className="h-2 rounded-full w-1/3 bg-white/10 mt-2 mb-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
