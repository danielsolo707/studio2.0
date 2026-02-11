"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Full-screen loading overlay.
 *
 * Counts from 0 → 100 over ~2 s, then fades out.
 * Renders as a fixed overlay so the rest of the page content
 * is always present in the DOM (important for SEO).
 *
 * Accessibility:
 * - `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`
 */
export function LoadingScreen() {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsVisible(false), 800);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
          exit={{
            opacity: 0,
            filter: 'blur(100px)',
            scale: 1.5,
            transition: { duration: 1.2, ease: 'easeInOut' },
          }}
          role="progressbar"
          aria-valuenow={Math.floor(count)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading portfolio"
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
