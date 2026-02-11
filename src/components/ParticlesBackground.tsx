"use client"

import React, { Suspense, lazy } from 'react';

const FloatingParticles = lazy(() =>
  import('@/components/three/FloatingParticles').then((m) => ({ default: m.FloatingParticles }))
);

/** Client wrapper for lazy-loaded floating particles background */
export function ParticlesBackground() {
  return (
    <Suspense fallback={null}>
      <FloatingParticles />
    </Suspense>
  );
}
