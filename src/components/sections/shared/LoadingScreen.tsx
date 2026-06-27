"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VISITED_KEY = 'studio2_intro_seen_v2';
type LoadingMode = 'checking' | 'intro' | 'loading' | 'done';

export function LoadingScreen() {
  const [mode, setMode] = useState<LoadingMode>('checking');
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const visited = localStorage.getItem(VISITED_KEY);
    if (visited) {
      setMode('loading');
      const timer = setTimeout(() => setMode('done'), 600);
      return () => clearTimeout(timer);
    }
    localStorage.setItem(VISITED_KEY, 'true');
    setMode('intro');
  }, []);

  useEffect(() => {
    if (mode !== 'intro') return;

    const duration = 2000;
    let frameId = 0;
    let hideTimer = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(((now - startedAt) / duration) * 100, 100);
      progressRef.current = progress;

      if (counterRef.current) {
        counterRef.current.textContent = String(Math.floor(progress));
      }

      if (progress >= 100) {
        hideTimer = window.setTimeout(() => setMode('done'), 800);
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(hideTimer);
    };
  }, [mode]);

  if (mode === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[250] bg-black flex items-center justify-center overflow-hidden"
        exit={{
          opacity: 0,
          filter: 'blur(100px)',
          scale: 1.5,
          transition: { duration: 1.2, ease: 'easeInOut' },
        }}
        role="progressbar"
        aria-valuenow={mode === 'intro' ? Math.floor(progressRef.current) : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Loading portfolio"
      >
        {mode === 'intro' ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <span
                ref={counterRef}
                className="font-headline text-[15vw] md:text-[10vw] font-bold text-accent tracking-tighter tabular-nums leading-none"
              >
                0
              </span>
              <motion.div
                className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div className="absolute bottom-12 left-12" aria-hidden="true">
              <p className="font-headline text-xs tracking-widest text-muted-foreground uppercase">
                Initializing Experience
              </p>
            </div>
          </>
        ) : (
          <div className="animate-pulse">
            <div className="font-headline text-2xl tracking-[0.5em] text-[#DFFF00]/40">
              LOADING
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
