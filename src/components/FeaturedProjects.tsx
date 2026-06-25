"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { TiltCard } from '@/components/three/TiltCard';
import type { Project } from '@/types/project';
import { VideoEmbed } from '@/components/VideoEmbed';
import {
  DISCIPLINE_LABELS,
  getProjectDiscipline,
  getProjectRole,
  getProjectStatus,
  STATUS_LABELS,
} from '@/lib/project-meta';

interface FeaturedProjectsProps {
  projects: Project[];
  maxProjects?: number;
}

export function FeaturedProjects({ projects, maxProjects = 3 }: FeaturedProjectsProps) {
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const [errorPreviewId, setErrorPreviewId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [focusPreviewPos, setFocusPreviewPos] = useState<{ left: number; top: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const sectionRectRef = useRef<DOMRect | null>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const featuredProjects = projects.slice(0, maxProjects);

  const handleSelect = useCallback(
    (project: Project) => {
      router.push(`/projects/${project.id}`);
    },
    [router],
  );

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    setIsTouch(isTouchDevice);
    const update = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      sectionRectRef.current = null;
    };
    update();
    const invalidateOnScroll = () => {
      sectionRectRef.current = null;
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', invalidateOnScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', invalidateOnScroll);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (rafRef.current !== null) return;
    const { clientX, clientY } = e;
    rafRef.current = requestAnimationFrame(() => {
      setMousePos({ x: clientX, y: clientY });
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove as EventListener);
    return () => window.removeEventListener('mousemove', handleMouseMove as EventListener);
  }, [handleMouseMove]);

  const getPreviewPosition = useCallback(() => {
    if (focusPreviewPos) return focusPreviewPos;
    const previewWidth = 320;
    const previewHeight = 192;
    const offset = 16;
    const margin = 12;
    const vw = viewport.w || window.innerWidth || 1920;
    const vh = viewport.h || window.innerHeight || 1080;

    let left = mousePos.x + offset;
    let top = mousePos.y + offset;

    if (left + previewWidth > vw - margin) {
      left = mousePos.x - previewWidth - offset;
    }
    if (left < margin) {
      left = margin;
    }

    if (top + previewHeight > vh - margin) {
      top = mousePos.y - previewHeight - offset;
    }
    if (top < margin) {
      top = margin;
    }

    return { left, top };
  }, [mousePos.x, mousePos.y, viewport.w, viewport.h, focusPreviewPos]);

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => new Set([...prev, id]));
    setErrorPreviewId(id);
    setLoadingPreviewId(null);
  }, []);

  const handleImageLoad = useCallback((id: string) => {
    setLoadingPreviewId((prev) => (prev === id ? null : prev));
    setErrorPreviewId((prev) => (prev === id ? null : prev));
  }, []);

  const startPreviewLoad = useCallback((project: Project) => {
    if (!project.imageUrl) return;
    setLoadingPreviewId(project.id);
    setErrorPreviewId(null);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="works"
      aria-labelledby="works-heading"
      className="relative z-20 py-16 md:py-20 px-6 md:px-16 overflow-hidden scroll-mt-24"
      onMouseLeave={() => setActiveProject(null)}
      style={{ contentVisibility: 'auto' } as React.CSSProperties}
    >
      <div className="absolute inset-0 section-sheen pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-6 md:ml-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="works-heading"
              className="font-headline text-[11px] md:text-[12px] tracking-[0.4em] md:tracking-[0.7em] text-[#DFFF00] uppercase opacity-60"
            >
              FEATURED WORKS
            </h2>
            <p className="mt-3 max-w-xl text-sm md:text-base text-white/45 font-body leading-relaxed">
              A curated selection of motion studies and interactive systems.
            </p>
          </div>

          <Link
            href="/gateway"
            className="group flex items-center gap-2 font-headline text-[10px] tracking-[0.25em] text-white/70 hover:text-[#DFFF00] transition-colors"
          >
            EXPLORE ALL PROJECTS →
          </Link>
        </div>

        {featuredProjects.map((project, index) => {
          const status = getProjectStatus(project);
          const discipline = getProjectDiscipline(project);
          const role = getProjectRole(project);
          const isActive = activeProject?.id === project.id;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -80px 0px' }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              onMouseEnter={() => {
                setActiveProject(project);
                startPreviewLoad(project);
              }}
              onMouseLeave={() => setActiveProject(null)}
              onClick={() => handleSelect(project)}
              role="button"
              tabIndex={0}
              aria-label={`View ${project.name} project (${project.year}) - ${project.category}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(project);
                }
              }}
              onFocus={() => {
                setActiveProject(project);
                startPreviewLoad(project);
                const rowEl = rowRefs.current.get(project.id);
                if (rowEl) {
                  const rect = rowEl.getBoundingClientRect();
                  setFocusPreviewPos({
                    left: Math.min(rect.right + 18, window.innerWidth - 338),
                    top: Math.max(18, rect.top),
                  });
                }
              }}
              onBlur={() => {
                setActiveProject(null);
                setFocusPreviewPos(null);
              }}
              className="group relative border-b border-white/5 cursor-pointer transition-colors duration-300 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#DFFF00]/50 focus-visible:outline-offset-4 mb-4"
            >
              {/* Single lightweight hover wash (removed expensive blur-xl gradient) */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#DFFF00]/0 via-[#DFFF00]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm pointer-events-none" />
              <div
                ref={(el) => {
                  if (el) rowRefs.current.set(project.id, el);
                  else rowRefs.current.delete(project.id);
                }}
              >
              <TiltCard maxTilt={6} glareOpacity={0} disabled={isTouch}>
                <div className="py-5 md:py-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative">
                  <div className="min-w-0 flex items-start gap-4 md:gap-6">
                    <span className="font-headline text-[10px] md:text-xs tracking-[0.2em] text-white/20 group-hover:text-[#DFFF00]/50 transition-colors mt-2 md:mt-3 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3 text-[9px] font-headline tracking-[0.32em] text-white/45">
                        <span className="text-[#DFFF00]/70">{DISCIPLINE_LABELS[discipline]}</span>
                        <span className="h-[1px] w-6 bg-white/15" aria-hidden="true" />
                        <span>{role || project.category}</span>
                      </div>
                      <h3 className="mt-2 font-headline text-2xl md:text-[clamp(2rem,3.25vw,3.5rem)] tracking-[-0.02em] text-white bg-transparent transition-colors duration-300 group-hover:text-[#DFFF00]">
                        {project.name}
                      </h3>
                      <div
                        className="mt-3 h-[1px] bg-white/15"
                        style={{ width: isActive ? 96 : 48, opacity: isActive ? 0.9 : 0.4, transition: 'width 0.4s ease, opacity 0.4s ease' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span
                      className="font-headline text-[12px] tracking-[0.2em] text-white/70 hidden md:block transition-all duration-300"
                      style={{ opacity: isActive ? 1 : 0.7, transform: isActive ? 'translateY(0)' : 'translateY(4px)' }}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                    <span
                      className="font-headline text-[12px] tracking-widest text-white/70 group-hover:text-[#DFFF00] transition-colors"
                      style={{ opacity: isActive ? 1 : 0.7, transform: isActive ? 'translateY(0)' : 'translateY(4px)' }}
                    >
                      {project.year}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#DFFF00] transition-all duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    <div className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-[#DFFF00] transition-colors" />
                  </div>
                </div>

                {project.imageUrl && (
                  <div className="md:hidden mt-3 mb-1 overflow-hidden border border-white/5">
                    <img
                      src={project.imageUrl}
                      alt={`Thumbnail of ${project.name}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </TiltCard>
              </div>
            </motion.div>
          );
        })}

        <nav aria-label="Project pages" className="sr-only">
          {featuredProjects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              {p.name}
            </Link>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: 'fixed',
              ...getPreviewPosition(),
              pointerEvents: 'none',
              zIndex: 100,
            }}
            data-project-preview="true"
            className="relative w-80 h-48 overflow-hidden border border-[#DFFF00]/20 bg-black shadow-[0_0_60px_rgba(223,255,0,0.16)] hidden md:block"
          >
            {(() => {
              const showError =
                errorPreviewId === activeProject.id ||
                failedImages.has(activeProject.id);
              const showLoading = loadingPreviewId === activeProject.id && !showError;
              const src = activeProject.imageUrl ? `${activeProject.imageUrl}` : '';
              const videoSrc = activeProject.videoUrl || activeProject.media?.find(m => m.type === 'video')?.url || '';
              const discipline = getProjectDiscipline(activeProject);

              if (showError || (!activeProject.imageUrl && !videoSrc)) {
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black/90 px-6 text-center">
                    <div className="font-headline text-[10px] tracking-[0.35em] text-[#DFFF00]">
                      {DISCIPLINE_LABELS[discipline]}
                    </div>
                    <div className="font-body text-sm text-white/50 leading-relaxed">
                      {activeProject.role || activeProject.category}
                    </div>
                  </div>
                );
              }

              return (
                <>
                  {src ? (
                    <img
                      key={src}
                      src={src}
                      alt={`Preview of ${activeProject.name}`}
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
                      style={{ filter: 'grayscale(0.3)' }}
                      onError={() => handleImageError(activeProject.id)}
                      onLoad={() => handleImageLoad(activeProject.id)}
                    />
                  ) : videoSrc && !activeProject.imageUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                      <div className="font-headline text-[10px] tracking-[0.35em] text-[#DFFF00]">
                        {DISCIPLINE_LABELS[discipline]}
                      </div>
                    </div>
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(223,255,0,0.18),transparent_55%)] opacity-60" />
                  {showLoading && (
                    <div
                      className="absolute inset-0 preview-surface flex items-center justify-center"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="loader-ring" />
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
