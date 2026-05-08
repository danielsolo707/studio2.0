"use client"

import React, { Suspense, lazy } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MobileMenu } from '@/components/MobileMenu';

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
  return (
    <div className="relative h-[120vh] z-40" role="banner">
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
          <div className="flex flex-col justify-center z-10 md:max-w-[50%] pt-20 md:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="font-headline text-5xl md:text-8xl lg:text-9xl leading-[0.9] text-white tracking-tighter text-left">
                <span className="italic font-bold block">CREATIVE</span>
                <span className="block">DEVELOPER</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 font-body text-sm md:text-base text-white/60 max-w-md leading-relaxed"
            >
              Junior creative developer building motion-led web prototypes,
              data visuals and early ML experiments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-6 flex flex-wrap gap-2"
              aria-label="Current focus areas"
            >
              {['Motion Design', 'Creative Code', 'Data/ML Learning'].map((item) => (
                <span
                  key={item}
                  className="border border-white/10 px-3 py-2 font-headline text-[8px] tracking-[0.25em] text-white/50"
                >
                  {item}
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="mt-5 font-headline text-[9px] tracking-[0.25em] text-[#DFFF00]"
            >
              AVAILABLE FOR JUNIOR CREATIVE TECH / MOTION-LED WEB ROLES
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-4 md:gap-6"
            >
              <a
                href="#works"
                className="px-8 py-3 bg-[#DFFF00] text-black font-headline text-[10px] tracking-[0.2em] hover:bg-[#DFFF00]/80 transition-all duration-300"
              >
                VIEW WORKS
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3 border border-white/15 font-headline text-[10px] tracking-[0.2em] text-white/60 hover:border-[#DFFF00]/50 hover:text-[#DFFF00] transition-colors"
              >
                GITHUB
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
