"use client"

import React, { useRef, useCallback, useState } from 'react';

/**
 * 3D tilt wrapper — pure CSS transforms, no Three.js overhead.
 * Wraps any children with a perspective tilt that follows the mouse.
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 12,
  glareOpacity = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) {
          rafRef.current = null;
          return;
        }
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const tiltX = (y - 0.5) * -maxTilt;
        const tiltY = (x - 0.5) * maxTilt;

        setTransform(
          `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`
        );
        setGlarePos({ x: x * 100, y: y * 100 });
        rafRef.current = null;
      });
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}

      {/* Glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(223,255,0,${glareOpacity}), transparent 60%)`,
        }}
      />
    </div>
  );
}
