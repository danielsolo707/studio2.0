"use client"

import React, { useRef, useCallback, useEffect } from 'react';

/**
 * 3D tilt wrapper — pure CSS transforms, no Three.js overhead.
 * Wraps any children with a perspective tilt that follows the mouse.
 *
 * Performance:
 * - Uses direct DOM mutation via refs (zero React re-renders on mouse move)
 * - Disabled on touch/hover-less devices (no tilt benefit on touch)
 * - Only sets willChange on hover, not permanently
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 12,
  glareOpacity = 0.15,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
  disabled?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isTouchRef = useRef(false);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    isTouchRef.current =
      disabled || (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches);
  }, [disabled]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchRef.current || !cardRef.current) return;
      if (rafRef.current !== null) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      const rect = cardRef.current.getBoundingClientRect();
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const card = cardRef.current;
        if (!card) return;
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        const tiltX = (y - 0.5) * -maxTilt;
        const tiltY = (x - 0.5) * maxTilt;

        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`;

        if (glareRef.current) {
          glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(223,255,0,${glareOpacity}), transparent 60%)`;
        }
      });
    },
    [maxTilt, glareOpacity],
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const card = cardRef.current;
    if (card) {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.willChange = 'auto';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
    isHoveredRef.current = false;
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    const card = cardRef.current;
    if (card) card.style.willChange = 'transform';
    if (glareRef.current) glareRef.current.style.opacity = '1';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}

      {/* Glare overlay */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
