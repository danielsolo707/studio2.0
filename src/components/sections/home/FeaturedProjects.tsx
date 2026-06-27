"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { TiltCard } from '@/components/three/TiltCard';
import type { Project } from '@/types/project';
import {
  DISCIPLINE_LABELS,
  getProjectDiscipline,
  getProjectRole,
  getProjectStatus,
  STATUS_LABELS,
} from '@/lib/cms/project-meta';

interface FeaturedProjectsProps {
  projects: Project[];
  maxProjects?: number;
}

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 192;
const PREVIEW_OFFSET = 16;
const PREVIEW_MARGIN = 12;

function computePreviewPosition(
  mx: number,
  my: number,
  vw: number,
  vh: number,
) {
  // Track the cursor directly: offset to the right, centered vertically.
  // Clamp (never flip) so the target never teleports across the cursor —
  // the spring stays continuous and the preview glues to the pointer.
  const left = Math.max(
    PREVIEW_MARGIN,
    Math.min(mx + PREVIEW_OFFSET, vw - PREVIEW_WIDTH - PREVIEW_MARGIN),
  );
  const top = Math.max(
    PREVIEW_MARGIN,
    Math.min(my - PREVIEW_HEIGHT / 2, vh - PREVIEW_HEIGHT - PREVIEW_MARGIN),
  );

  return { left, top };
}

export function FeaturedProjects({ projects, maxProjects = 3 }: FeaturedProjectsProps) {
  const router = useRouter();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const [errorPreviewId, setErrorPreviewId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  /* ── Mouse-follow motion values (updated directly, no React re-render) ── */
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const springX = useSpring(targetX, { stiffness: 700, damping: 35, mass: 0.3 });
  const springY = useSpring(targetY, { stiffness: 700, damping: 35, mass: 0.3 });

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
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const { left, top } = computePreviewPosition(e.clientX, e.clientY, vw, vh);
      targetX.set(left);
      targetY.set(top);
    },
    [targetX, targetY],
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

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

  const positionPreviewAtRow = useCallback(
    (projectId: string) => {
      const rowEl = rowRefs.current.get(projectId);
      if (!rowEl) return;
      const rect = rowEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = rect.right + 18;
      let top = rect.top;

      if (left + PREVIEW_WIDTH > vw - PREVIEW_MARGIN) {
        left = rect.left - PREVIEW_WIDTH - 18;
      }
      if (left < PREVIEW_MARGIN) {
        left = PREVIEW_MARGIN;
      }
      if (top + PREVIEW_HEIGHT > vh - PREVIEW_MARGIN) {
        top = vh - PREVIEW_HEIGHT - PREVIEW_MARGIN;
      }
      if (top < PREVIEW_MARGIN) {
        top = PREVIEW_MARGIN;
      }

      targetX.set(left);
      targetY.set(top);
    },
    [targetX, targetY],
  );

  return (
    <section
      id="works"
      aria-labelledby="works-heading"
      className="relative z-20 py-16 md:py-20 px-6 md:px-16 overflow-hidden scroll-mt-24"
      onMouseLeave={() => setActiveProject(null)}
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
            EXPLORE ALL PROJECTS
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
                positionPreviewAtRow(project.id);
              }}
              onBlur={() => {
                setActiveProject(null);
              }}
              className="group relative border-b border-white/5 cursor-pointer transition-colors duration-300 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#DFFF00]/50 focus-visible:outline-offset-4 mb-4"
            >
              {/* Single lightweight hover wash */}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              x: springX,
              y: springY,
              pointerEvents: 'none',
              zIndex: 100,
              willChange: 'transform',
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
