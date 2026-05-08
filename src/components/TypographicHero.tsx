"use client"

import React, { Suspense, lazy } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MobileMenu } from '@/components/MobileMenu';

const HeroCube = lazy(() =>
  import('@/components/three/HeroCube').then((m) => ({ default: m.HeroCube }))
);

interface TypographicHeroProps {
  headline?: string;
  description?: string;
}

/**
 * Full-viewport hero with left-aligned text + right-side 3D cube.
 * Layout inspired by Resend.com — clean split design.
 *
 * Accessibility:
 * - Single semantic `<h1>` containing both text lines
 * - `<nav>` landmark with anchor links
 */
export function TypographicHero({ headline, description }: TypographicHeroProps) {
  const { scrollYProgress } = useScroll();

  const yMove = useTransform(scrollYProgress, [0, 0.4], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 1.05]);
  return (
    <div className="relative h-[100vh] z-40" role="banner">
      {/* ─── Header ─── */}
      <motion.header
        className="fixed top-0 w-full flex justify-between items-center p-6 md:p-10 z-50 backdrop-blur-md bg-black/50 border-b border-white/10"
      >
        <Link href="/" className="font-headline text-[11px] font-bold tracking-[0.35em] text-white hover:text-[#DFFF00] transition-colors">
          THE FLUID LOGIC
        </Link>

{/* Desktop Navigation */}
         <nav aria-label="Main navigation" className="hidden md:flex gap-4 md:gap-8">
           <a
             href="#about"
             className="font-headline text-[9px] tracking-[0.3em] text-white/60 hover:text-[#DFFF00] transition-colors"
           >
             ABOUT
           </a>
           <a
             href="#works"
             className="font-headline text-[9px] tracking-[0.3em] text-white/60 hover:text-[#DFFF00] transition-colors"
           >
             WORKS
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

        {/* Mobile Menu */}
        <MobileMenu />
      </motion.header>

      {/* ─── Hero: text left + cube right ─── */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden pt-32 md:pt-44">
        <motion.div
          style={{ opacity, y: yMove, scale }}
          className="w-full h-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24"
        >
          {/* Left — text content */}
          <div className="flex flex-col justify-center z-10 md:max-w-[45%] pt-20 md:pt-0 relative">
            <div className="absolute right-0 top-1/4 w-64 h-64 bg-[#DFFF00]/5 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
<h1 className="font-headline text-5xl md:text-8xl lg:text-9xl leading-[0.9] text-white tracking-tighter text-left whitespace-pre-line">
                {headline || 'CREATIVE\nDEVELOPER'}
              </h1>
            </motion.div>

<motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-6 font-body text-base md:text-lg text-white/70 max-w-lg leading-relaxed"
            >
              {description || 'Creative developer specializing in motion design (After Effects, Cinema 4D) and machine learning. Building interactive web experiences that blend visual storytelling with intelligent systems.'}
            </motion.p>

<motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-8"
            >
              <a
                href="#works"
                className="inline-block px-8 py-3 bg-[#DFFF00] text-black font-headline text-[10px] tracking-[0.2em] hover:bg-[#DFFF00]/80 transition-all duration-300"
              >
                VIEW WORKS
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-12"
              aria-hidden="true"
            >
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-6"
              >
                <div className="h-[1px] w-12 bg-[#DFFF00]/40" />
                <p className="font-headline text-[13px] tracking-[1em] text-[#DFFF00]/60">
                  SCROLL TO EXPLORE
                </p>
                <div className="h-[1px] w-12 bg-[#DFFF00]/40" />
              </motion.div>
            </motion.div>
          </div>

          {/* Right — 3D interactive cube */}
          <div className="relative w-full md:w-[55%] h-[50vh] md:h-full flex items-center justify-center pointer-events-auto md:-ml-12">
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
