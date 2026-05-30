"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VISITED_KEY = 'studio2_intro_seen_v2';
type LoadingMode = 'checking' | 'intro' | 'loading' | 'done';

export function LoadingScreen() {
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState<LoadingMode>('checking');

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
      setCount(progress);

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
        className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
        exit={{
          opacity: 0,
          filter: 'blur(100px)',
          scale: 1.5,
          transition: { duration: 1.2, ease: 'easeInOut' },
        }}
        role="progressbar"
        aria-valuenow={mode === 'intro' ? Math.floor(count) : 0}
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
              <span className="font-headline text-[15vw] md:text-[10vw] font-bold text-accent tracking-tighter tabular-nums leading-none">
                {Math.floor(count)}
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
