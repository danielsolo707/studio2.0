"use client"

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

const FloatingParticles = lazy(() =>
  import('@/components/three/FloatingParticles').then((m) => ({ default: m.FloatingParticles }))
);

export function ParticlesBackground() {
  const [paused, setPaused] = useState(false);
  const prevPaused = useRef(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = window.scrollY > window.innerHeight * 0.5;
        if (next !== prevPaused.current) {
          prevPaused.current = next;
          setPaused(next);
        }
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
