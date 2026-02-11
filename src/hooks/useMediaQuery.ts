"use client"

import { useState, useEffect } from 'react';

/** Reactive CSS media-query hook (SSR-safe) */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/** True when viewport ≤ 768 px */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/** True when the user prefers reduced motion */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
