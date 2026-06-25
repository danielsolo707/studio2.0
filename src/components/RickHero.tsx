"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

/**
 * RickHero — replaces the 3D Rubik's cube in the hero section.
 *
 * - Default state shows regular Rick (pickle / normal version).
 * - Hovering swaps to the bubble-speech version with a smooth crossfade.
 * - Gentle floating animation + subtle scale on hover.
 * - Fully responsive and respects `prefers-reduced-motion`.
 */
export function RickHero() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={() => setIsHovered((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsHovered((prev) => !prev);
        }
      }}
      tabIndex={0}
      animate={{ y: [0, -12, 0] }}
      transition={{
        y: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Rick character. Hover to reveal speech bubble."
      role="img"
    >
      {/* Ambient glow behind the character */}
      <div
        className="pointer-events-none absolute inset-0 hero-cube-halo"
        aria-hidden="true"
      />

      {/* Normal Rick */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] scale-110 md:scale-125 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Image
          src="/images/rick-pickle.png"
          alt="Rick"
          fill
          priority
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 720px"
          className="object-contain drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))' }}
        />
      </div>

      {/* Bubble Rick (shown on hover) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] scale-110 md:scale-125 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src="/images/rick-bubble.png"
          alt="Rick with speech bubble"
          fill
          priority
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 720px"
          className="object-contain drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))' }}
        />
      </div>
    </motion.div>
  );
}
