"use client"

import React, { Suspense, lazy } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HeroCube = lazy(() =>
  import('@/components/three/HeroCube').then((m) => ({ default: m.HeroCube }))
);

/**
 * Full-viewport hero with left-aligned text + right-side 3D cube.
 * Layout inspired by Resend.com — clean split design.
 *
 * Accessibility:
 * - Single semantic `<h1>` containing both text lines
 * - `<nav>` landmark with anchor links
 */
export function TypographicHero() {
  const { scrollYProgress } = useScroll();

  const yMove = useTransform(scrollYProgress, [0, 0.4], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 1.05]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="relative h-[120vh] z-10" role="banner">
      {/* ─── Header ─── */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="fixed top-0 w-full flex justify-between items-center p-6 md:p-10 z-50 backdrop-blur-md bg-black/50 border-b border-white/10"
      >
        <a href="/" className="font-headline text-[11px] font-bold tracking-[0.35em] text-white hover:text-[#DFFF00] transition-colors">
          THE FLUID LOGIC
        </a>

        <nav aria-label="Main navigation" className="flex gap-4 md:gap-8">
          <a
            href="#about"
            className="font-headline text-[9px] tracking-[0.3em] text-white/60 hover:text-[#DFFF00] transition-colors"
          >
            ABOUT
          </a>
          <a
            href="#contact"
            className="font-headline text-[9px] tracking-[0.3em] text-white/60 hover:text-[#DFFF00] transition-colors"
          >
            CONTACT
          </a>
          <span className="font-headline text-[9px] tracking-[0.3em] text-[#DFFF00] opacity-80">
            &copy;2026
          </span>
        </nav>
      </motion.header>

      {/* ─── Hero: text left + cube right ─── */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden pt-32 md:pt-44">
        <motion.div
          style={{ opacity, y: yMove, scale }}
          className="w-full h-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24"
        >
          {/* Left — text content */}
          <div className="flex flex-col justify-center z-10 md:max-w-[50%] pt-20 md:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="font-headline text-5xl md:text-8xl lg:text-9xl leading-[0.9] text-white tracking-tighter text-left">
                <span className="italic font-bold block">MOTION</span>
                <span className="block">DESIGNER</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 font-body text-sm md:text-base text-white/60 max-w-md leading-relaxed"
            >
              Crafting immersive cinematic experiences through motion,
              3D&nbsp;graphics&nbsp;and digital storytelling.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 flex items-center gap-6"
            >
              <a
                href="#about"
                className="px-8 py-3 bg-[#DFFF00] text-black font-headline text-[10px] tracking-[0.2em] hover:bg-[#DFFF00]/80 transition-all duration-300"
              >
                ABOUT ME
              </a>
              <a
                href="#contact"
                className="font-headline text-[10px] tracking-[0.2em] text-white/50 hover:text-[#DFFF00] transition-colors"
              >
                GET IN TOUCH
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-16 flex items-center gap-6"
              aria-hidden="true"
            >
              <div className="h-[1px] w-12 bg-[#DFFF00]/30" />
              <p className="font-headline text-[8px] tracking-[1em] text-[#DFFF00]/50">
                SCROLL TO EXPLORE
              </p>
              <div className="h-[1px] w-12 bg-[#DFFF00]/30" />
            </motion.div>
          </div>

          {/* Right — 3D interactive cube */}
          <div className="relative w-full md:w-[50%] h-[50vh] md:h-full flex items-center justify-center pointer-events-auto">
            <Suspense fallback={
              <div className="w-48 h-48 border border-white/5 animate-pulse" />
            }>
              <HeroCube />
            </Suspense>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
