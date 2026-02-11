"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockScroll } from '@/hooks/useLockScroll';
import type { Project } from '@/types/project';

/**
 * Full-screen project detail overlay (modal).
 *
 * Accessibility:
 * - `role="dialog"` + `aria-modal="true"`
 * - Focus trapped while open
 * - Body scroll locked while open
 * - Escape key closes the overlay
 */
export function ProjectOverlay({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [showContent, setShowContent] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const isOpen = project !== null;

  const containerRef = useFocusTrap(isOpen);
  useLockScroll(isOpen);

  /* ─── Escape key ─── */
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleEscape]);

  /* ─── Delayed content reveal ─── */
  useEffect(() => {
    if (project) {
      setImageLoaded(true);
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.name} project details`}
          className="fixed inset-0 z-[100] bg-[#030305] flex flex-col overflow-y-auto"
        >
          {/* ─── Hero image ─── */}
          <motion.div
            className="relative w-full aspect-video md:h-[70vh] z-0 overflow-hidden bg-black/50"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {imageLoaded ? (
              <>
                <Image
                  src={project.imageUrl}
                  alt={`${project.name} — ${project.description}`}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                  onError={() => setImageLoaded(false)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-transparent" />

              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#030305] via-black/40 to-transparent">
                <div className="text-center">
                  <div className="text-[#DFFF00] font-headline text-lg tracking-widest mb-2">
                    IMAGE
                  </div>
                  <div className="text-white/40 font-body text-sm">UNABLE TO LOAD</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* ─── Content ─── */}
          <div className="relative z-10 flex-1 flex flex-col p-6 md:p-24 bg-[#030305]">
            <motion.button
              onClick={onClose}
              className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 font-headline text-[10px] tracking-[0.4em] text-white hover:text-[#DFFF00] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#DFFF00]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              aria-label="Go back to project list"
            >
              <ArrowLeft size={16} /> BACK TO LIST
            </motion.button>

            <div className="max-w-5xl space-y-12 mt-16 md:mt-12">
              <motion.h2
                className="font-headline text-4xl md:text-[8vw] leading-none tracking-tighter italic text-white"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {project.name}
              </motion.h2>

              <AnimatePresence>
                {showContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                  >
                    <p className="font-body text-xl md:text-3xl text-white/60 max-w-3xl leading-relaxed">
                      {project.description}
                    </p>

                    <dl className="flex flex-wrap gap-8 md:gap-16 pt-12 border-t border-white/10">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.5em] text-[#DFFF00] mb-4 font-headline">
                          YEAR
                        </dt>
                        <dd className="font-headline text-lg text-white">{project.year}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.5em] text-[#DFFF00] mb-4 font-headline">
                          CATEGORY
                        </dt>
                        <dd className="font-headline text-lg text-white">{project.category}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.5em] text-[#DFFF00] mb-4 font-headline">
                          TOOLS
                        </dt>
                        <dd className="font-headline text-lg text-white">{project.tools}</dd>
                      </div>
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
