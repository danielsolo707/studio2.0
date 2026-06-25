"use client"

import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
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
 * Performance:
 * - Active-nav indicator is a continuous scroll-progress fill (like a scrollbar)
 *   driven by GPU-composited motion values — no per-scroll reflow, no flicker.
 * - Section ranges measured once on mount/resize (single getBoundingClientRect pass).
 * - Pauses the 3D cube when hero scrolls out of view.
 *
 * Accessibility:
 * - Single semantic `<h1>` containing both text lines
 * - `<nav>` landmark with anchor links
 */
export function TypographicHero({ headline, description }: TypographicHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  // Per-section scroll-progress ranges [startProgress, endProgress] over the
  // whole page (0..1). Measured once on mount + resize, stored in a ref so the
  // rAF transform closures always read fresh values without re-creating hooks.
  const rangesRef = useRef<Record<string, [number, number]>>({
    works: [0, 1],
    about: [0, 1],
    contact: [0, 1],
  });

  // Discrete nav state: which section is currently being scrolled through
  // (active) and which have been started (lit). Updated only at section
  // boundaries so re-renders are minimal — the smooth fill is driven by motion
  // values, not React state.
  const [navState, setNavState] = useState<{
    active: string;
    lit: Record<string, boolean>;
  }>({ active: '', lit: { works: false, about: false, contact: false } });

  // Lightweight scroll listener for header bg only (single state bit, no layout reads)
  useEffect(() => {
    let frame = 0;
    let prevScrolled = false;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = window.scrollY > 24;
        if (next !== prevScrolled) {
          prevScrolled = next;
          setIsScrolled(next);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Pause 3D rendering when hero is off-screen (IntersectionObserver — zero reflow)
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // Measure each section's [start, end] progress over the full page scroll.
  // One-time read (no per-scroll reflow). Re-measured on resize / load.
  useEffect(() => {
    const ids = ['works', 'about', 'contact'] as const;

    const measure = () => {
      const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const center = window.innerHeight * 0.5;
      const next: Record<string, [number, number]> = { ...rangesRef.current };

      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.offsetTop;
        const nextEl = document.getElementById(ids[i + 1]);
        const bottom = nextEl ? nextEl.offsetTop : top + el.offsetHeight;
        next[id] = [
          Math.max(0, Math.min(1, (top - center) / total)),
          Math.max(0, Math.min(1, (bottom - center) / total)),
        ];
      });

      rangesRef.current = next;
      // Nudge scrollYProgress listeners so fills recompute after remeasure.
      window.dispatchEvent(new Event('scroll'));
    };

    measure();
    const t1 = window.setTimeout(measure, 400);
    const t2 = window.setTimeout(measure, 1600);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // Drive active/lit state from scroll progress (only re-renders at boundaries).
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const r = rangesRef.current;
    const lit = {
      works: v >= r.works[0] - 0.0001,
      about: v >= r.about[0] - 0.0001,
      contact: v >= r.contact[0] - 0.0001,
    };
    let active = '';
    for (const id of ['works', 'about', 'contact'] as const) {
      if (v >= r[id][0] && v < r[id][1]) {
        active = id;
        break;
      }
    }
    setNavState((prev) => {
      if (
        prev.active === active &&
        prev.lit.works === lit.works &&
        prev.lit.about === lit.about &&
        prev.lit.contact === lit.contact
      ) {
        return prev; // React bails out — no re-render
      }
      return { active, lit };
    });
  });

  const handleNavClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;
    const headerOffset = window.innerWidth >= 768 ? 86 : 68;
    window.scrollTo({
      top: Math.max(0, element.offsetTop - headerOffset),
      behavior: 'smooth',
    });
  }, []);

  // Per-section fill motion values. Stable transformers read from rangesRef so
  // they always use the latest measurements without re-creating the hooks.
  const fillOf = useCallback((id: 'works' | 'about' | 'contact') => (v: number) => {
    const [s, e] = rangesRef.current[id];
    if (e <= s) return 0;
    return Math.max(0, Math.min(1, (v - s) / (e - s)));
  }, []);

  const worksFill = useTransform(scrollYProgress, fillOf('works'));
  const aboutFill = useTransform(scrollYProgress, fillOf('about'));
  const contactFill = useTransform(scrollYProgress, fillOf('contact'));

  const navItems: { id: 'works' | 'about' | 'contact'; label: string; href: string; fill: MotionValue<number> }[] = useMemo(
    () => [
      { id: 'works', label: 'WORKS', href: '#works', fill: worksFill },
      { id: 'about', label: 'ABOUT', href: '#about', fill: aboutFill },
      { id: 'contact', label: 'CONTACT', href: '#contact', fill: contactFill },
    ],
    [worksFill, aboutFill, contactFill],
  );

  const yMove = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.02]);
  const resolvedHeadline = headline || 'CREATIVE\nDEVELOPER';
  const headlineLines = resolvedHeadline.split('\n');

  return (
    <div className="relative min-h-[100svh] z-40 scroll-smooth" role="banner">
      {/* ─── Header ─── */}
      <motion.header
        className={`fixed top-0 left-0 right-0 h-16 md:h-20 flex justify-between items-center px-6 md:px-10 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${
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
            const isActive = navState.active === item.id;
            const isLit = navState.lit[item.id];
            const colorClass = isActive
              ? 'text-[#DFFF00]'
              : isLit
                ? 'text-[#DFFF00]/55 hover:text-[#DFFF00]'
                : 'text-white/60 hover:text-[#DFFF00]';
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative font-headline text-[8px] tracking-[0.2em] md:tracking-[0.25em] transition-colors duration-200 ${colorClass}`}
              >
                <span className="relative pb-2">
                  {item.label}
                  {/* Faint hover affordance line */}
                  <span className="absolute left-0 -bottom-1 h-[1px] w-full origin-left scale-x-0 bg-white/25 transition-transform duration-200 group-hover:scale-x-100" />
                  {/* Continuous scrollbar-style progress fill (yellow) */}
                  <motion.span
                    className="absolute left-0 -bottom-[1px] h-[2px] w-full origin-left bg-[#DFFF00]"
                    style={{ scaleX: item.fill, boxShadow: '0 0 6px rgba(223,255,0,0.65)' }}
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
      <div ref={heroRef} className="sticky top-0 min-h-[100svh] flex items-center overflow-hidden pt-16 md:pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="hero-ambient absolute -right-[15%] top-[-10%] h-[120%] w-[75%] opacity-70 animate-drift-slow"
            aria-hidden="true"
          />
          <div
            className="hero-grid absolute -right-[10%] top-[-5%] h-[120%] w-[70%] opacity-40"
            aria-hidden="true"
          />
          <div className="hero-vignette absolute inset-0" aria-hidden="true" />
        </div>
        <motion.div
          style={{ opacity, y: yMove, scale }}
          className="w-full min-h-[100svh] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 px-6 py-12 md:py-24 md:px-12 lg:px-16 xl:px-20"
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
              className="mt-10 block"
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

          {/* Right — 3D interactive cube (unmounts when hero is off-screen for zero GPU cost) */}
          <div className="relative w-full h-[45svh] min-h-[280px] max-h-[420px] md:h-[min(70svh,720px)] md:min-h-[500px] md:max-h-[760px] md:basis-[48%] md:max-w-[720px] flex items-center justify-center pointer-events-auto">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 hero-cube-halo" aria-hidden="true" />
            </div>
            {heroVisible ? (
              <Suspense fallback={
                <div className="w-48 h-48 border border-white/5 animate-pulse" />
              }>
                <HeroCube paused={!heroVisible} />
              </Suspense>
            ) : (
              <div className="w-48 h-48 border border-white/5" aria-hidden="true" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
