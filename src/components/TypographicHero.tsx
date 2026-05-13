"use client"

import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
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
  const { scrollYProgress, scrollY } = useScroll();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = useMemo(
    () => [
      { id: 'works', label: 'WORKS', href: '#works' },
      { id: 'about', label: 'ABOUT', href: '#about' },
      { id: 'contact', label: 'CONTACT', href: '#contact' },
    ],
    [],
  );

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 24);
  });

  const updateActiveSection = useCallback(() => {
    const ids = ['works', 'about', 'contact'];
    const headerOffset = window.innerWidth >= 768 ? 96 : 76;
    const probeY = window.scrollY + headerOffset + window.innerHeight * 0.22;
    const nextActive = ids.find((id, index) => {
      const element = document.getElementById(id);
      if (!element) return false;
      const top = element.offsetTop;
      const nextElement = document.getElementById(ids[index + 1]);
      const bottom = nextElement ? nextElement.offsetTop : document.body.scrollHeight;
      return probeY >= top && probeY < bottom;
    });

    setActiveSection(nextActive || '');
  }, []);

  useEffect(() => {
    let frameId = 0;
    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateActiveSection]);

  const handleNavClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setActiveSection(id);
    const element = document.getElementById(id);
    if (!element) return;
    const headerOffset = window.innerWidth >= 768 ? 86 : 68;
    window.scrollTo({
      top: Math.max(0, element.offsetTop - headerOffset),
      behavior: 'smooth',
    });
  }, []);

  const yMove = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.02]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const resolvedHeadline = headline || 'CREATIVE\nDEVELOPER';
  const headlineLines = resolvedHeadline.split('\n');

  return (
    <div className="relative min-h-[100svh] z-40 scroll-smooth" role="banner">
      {/* ─── Header ─── */}
      <motion.header
        className={`fixed top-0 left-0 right-0 h-16 md:h-20 flex justify-between items-center px-6 md:px-10 z-50 backdrop-blur-xl border-b transition-all duration-500 ${
          isScrolled
            ? 'bg-black/70 border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.55)]'
            : 'bg-black/35 border-white/10'
        }`}
      >
        <Link href="/" className="font-headline text-[11px] font-bold tracking-[0.35em] text-white hover:text-[#DFFF00] transition-colors">
          THE FLUID LOGIC
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex gap-4 md:gap-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative font-headline text-[9px] tracking-[0.3em] transition-colors duration-150 ${
                  isActive ? 'text-[#DFFF00]' : 'text-white/60 hover:text-[#DFFF00]'
                }`}
              >
                <span className="relative pb-2">
                  {item.label}
                  <span className="absolute left-0 -bottom-1 h-[1px] w-full origin-left scale-x-0 bg-white/20 transition-transform duration-150 group-hover:scale-x-100" />
                  <span
                    className={`absolute left-0 -bottom-1 h-[1px] w-full origin-left bg-[#DFFF00] transition-transform duration-150 ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </span>
              </a>
            );
          })}
        </nav>

        {/* Mobile Menu */}
        <MobileMenu />
      </motion.header>

      {/* ─── Hero: text left + cube right ─── */}
      <div className="sticky top-0 min-h-[100svh] flex items-center overflow-hidden pt-20 md:pt-24">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            style={{ y: glowY }}
            className="hero-ambient absolute -right-[15%] top-[-10%] h-[120%] w-[75%] opacity-70 animate-drift-slow"
            aria-hidden="true"
          />
          <motion.div
            style={{ y: gridY }}
            className="hero-grid absolute -right-[10%] top-[-5%] h-[120%] w-[70%] opacity-40"
            aria-hidden="true"
          />
          <div className="hero-vignette absolute inset-0" aria-hidden="true" />
        </div>
        <motion.div
          style={{ opacity, y: yMove, scale }}
          className="w-full min-h-[100svh] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 px-6 py-24 md:px-12 lg:px-16 xl:px-20"
        >
          {/* Left — text content */}
          <div className="flex w-full flex-col justify-center z-10 md:basis-[52%] md:max-w-[760px] relative">
            <div className="absolute right-0 top-1/4 w-64 h-64 bg-[#DFFF00]/5 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="font-headline text-[clamp(2.6rem,6.4vw,6.25rem)] leading-[0.92] text-white tracking-[-0.02em] text-left">
                {headlineLines.map((line, index) => (
                  <span key={`${line}-${index}`} className="block">
                    {line}
                  </span>
                ))}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-6 font-body text-[clamp(0.95rem,1.2vw,1.15rem)] text-white/70 max-w-xl leading-relaxed"
            >
              {description ||
                'Designing visual systems in motion. Blending cinematic craft with intelligent interaction to shape immersive digital experiences.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 flex flex-wrap items-center gap-3 text-[10px] font-headline tracking-[0.35em] text-white/50"
            >
              <span>MOTION</span>
              <span className="h-[1px] w-6 bg-white/20" aria-hidden="true" />
              <span>SYSTEMS</span>
              <span className="h-[1px] w-6 bg-white/20" aria-hidden="true" />
              <span>INTELLIGENCE</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-8"
            >
              <a
                href="#works"
                className="inline-flex items-center gap-3 px-8 py-3 bg-[#DFFF00] text-black font-headline text-[10px] tracking-[0.25em] hover:bg-[#DFFF00]/80 transition-all duration-300"
              >
                VIEW WORKS
                <span className="h-[1px] w-8 bg-black/40" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-10 hidden sm:block"
              aria-hidden="true"
            >
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-6"
              >
                <div className="h-[1px] w-12 bg-[#DFFF00]/40" />
                <p className="font-headline text-[11px] tracking-[0.9em] text-[#DFFF00]/60">
                  SCROLL TO EXPLORE
                </p>
                <div className="h-[1px] w-12 bg-[#DFFF00]/40" />
              </motion.div>
            </motion.div>
          </div>

          {/* Right — 3D interactive cube */}
          <div className="relative w-full h-[34svh] min-h-[230px] max-h-[360px] md:h-[min(70svh,720px)] md:min-h-[500px] md:max-h-[760px] md:basis-[48%] md:max-w-[720px] flex items-center justify-center pointer-events-auto">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 hero-cube-halo" aria-hidden="true" />
            </div>
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
