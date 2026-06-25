"use client"

import React, { Suspense, lazy, useEffect, useState } from 'react';

const FloatingParticles = lazy(() =>
  import('@/components/three/FloatingParticles').then((m) => ({ default: m.FloatingParticles }))
);

/** Client wrapper for lazy-loaded floating particles background.
 *  Auto-pauses when the user scrolls past the hero to free GPU cycles. */
export function ParticlesBackground() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setPaused(window.scrollY > window.innerHeight * 0.5);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <FloatingParticles paused={paused} />
    </Suspense>
  );
}
