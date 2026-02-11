"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TiltCard } from '@/components/three/TiltCard';
import type { Project } from '@/types/project';

/**
 * Project grid with hover preview tooltips.
 *
 * Changes vs. original:
 * - Removed unused `onHover` prop
 * - Mouse-move throttled via RAF
 * - `sizes` added to `<Image />`
 * - Category column visible on desktop
 * - Focus-visible outline for keyboard users
 * - Tooltip clamped to viewport bounds & hidden on mobile
 */
export function ProjectList({
  projects,
  onProjectClick,
}: {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}) {
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const [errorPreviewId, setErrorPreviewId] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const rafRef = useRef<number | null>(null);

  const handleSelect = useCallback(
    (project: Project) => {
      if (onProjectClick) {
        onProjectClick(project);
        return;
      }
      router.push(`/projects/${project.id}`);
    },
    [onProjectClick, router],
  );

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rafRef.current !== null) return;
    const { clientX, clientY } = e;
    rafRef.current = requestAnimationFrame(() => {
      setMousePos({ x: clientX, y: clientY });
      rafRef.current = null;
    });
  }, []);

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => new Set([...prev, id]));
    setErrorPreviewId(id);
    setLoadingPreviewId(null);
  }, []);

  const handleImageLoad = useCallback((id: string) => {
    setLoadingPreviewId((prev) => (prev === id ? null : prev));
    setErrorPreviewId((prev) => (prev === id ? null : prev));
  }, []);

  const startPreviewLoad = useCallback((id: string) => {
    setLoadingPreviewId(id);
    setErrorPreviewId(null);
  }, []);

  return (
    <section
      id="works"
      aria-labelledby="works-heading"
      className="relative z-20 min-h-screen py-[20vh] px-6 md:px-24 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="max-w-7xl mx-auto">
        <h2
          id="works-heading"
          className="font-headline text-[10px] tracking-[0.8em] text-[#DFFF00] mb-24 uppercase opacity-60 ml-6 md:ml-12"
        >
          SELECTED WORKS
        </h2>

        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            onMouseEnter={() => setActiveProject(project)}
            onMouseLeave={() => setActiveProject(null)}
            onClick={() => handleSelect(project)}
            role="button"
            tabIndex={0}
            aria-label={`View ${project.name} project (${project.year}) — ${project.category}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(project);
              }
            }}
            onFocus={() => setActiveProject(project)}
            className="group border-b border-white/5 cursor-pointer transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#DFFF00]/50 focus-visible:outline-offset-4 mb-8"
          >
            <TiltCard maxTilt={6} glareOpacity={0.0}>
            <motion.div
              whileHover={{ x: -10 }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
              style={{ willChange: 'transform' }}
              className="py-8 md:py-12 flex items-center justify-between"
            >
              <div>
                <h3 className="font-headline text-2xl md:text-5xl tracking-tighter text-[#DFFF00] bg-transparent transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(223,255,0,0.8)]">
                  {project.name}
                </h3>
                <span className="font-headline text-[9px] tracking-[0.3em] text-white/30 mt-1 block md:hidden">
                  {project.category}
                </span>
              </div>

              <div className="flex items-center gap-8">
                <span className="font-headline text-[9px] tracking-[0.3em] text-white/30 hidden md:block">
                  {project.category}
                </span>
                <span className="font-headline text-[10px] tracking-widest text-muted-foreground group-hover:text-[#DFFF00] opacity-50">
                  {project.year}
                </span>
              </div>
            </motion.div>
            </TiltCard>
          </motion.div>
        ))}

        {/* ─── Project links for SEO (visible to crawlers) ─── */}
        <nav aria-label="Project pages" className="sr-only">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              {p.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* ─── Hover preview tooltip (desktop only) ─── */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: 'fixed',
              left: Math.max(16, Math.min(mousePos.x + 30, (viewport.w || 9999) - 340)),
              top: Math.max(16, Math.min(mousePos.y + 30, (viewport.h || 9999) - 220)),
              pointerEvents: 'none',
              zIndex: 100,
            }}
            className="w-80 h-48 overflow-hidden border border-[#DFFF00]/20 bg-black shadow-[0_0_50px_rgba(223,255,0,0.1)] hidden md:block"
          >
            {(() => {
              const showError = errorPreviewId === activeProject.id || failedImages.has(activeProject.id) || !activeProject.imageUrl;
              const showLoading = loadingPreviewId === activeProject.id && !showError;
              const src = activeProject.imageUrl ? `${activeProject.imageUrl}?r=${retryNonce}` : '';

              if (showLoading) {
                return (
                  <div className="w-full h-full skeleton-shimmer bg-white/5 rounded-sm" role="status" aria-live="polite" />
                );
              }

              if (showError) {
                return (
                  <div className="w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="text-center space-y-2">
                      <div className="text-[#ff9f43] text-sm font-headline tracking-widest">PREVIEW</div>
                      <div className="text-white/50 text-xs">Not available</div>
                      <button
                        type="button"
                        className="text-[11px] px-3 py-1 border border-[#ff9f43]/60 text-[#ff9f43] rounded-full hover:bg-[#ff9f43]/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRetryNonce((n) => n + 1);
                          startPreviewLoad(activeProject.id);
                          setFailedImages((prev) => {
                            const next = new Set(prev);
                            next.delete(activeProject.id);
                            return next;
                          });
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                );
              }

              startPreviewLoad(activeProject.id);
              return (
                <Image
                  key={src}
                  src={src}
                  alt={`Preview of ${activeProject.name}`}
                  fill
                  sizes="320px"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  onError={() => handleImageError(activeProject.id)}
                  onLoadingComplete={() => handleImageLoad(activeProject.id)}
                />
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
