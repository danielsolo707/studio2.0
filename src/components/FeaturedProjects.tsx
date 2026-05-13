"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TiltCard } from '@/components/three/TiltCard';
import type { Project } from '@/types/project';
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
  const rafRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const featuredProjects = projects.slice(0, maxProjects);

  const handleSelect = useCallback(
    (project: Project) => {
      router.push(`/projects/${project.id}`);
    },
    [router],
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

  const getPreviewPosition = useCallback(() => {
    const previewWidth = 320;
    const previewHeight = 192;
    const margin = 18;
    const sectionRect = sectionRef.current?.getBoundingClientRect();
    const maxTopByViewport = (viewport.h || window.innerHeight || 9999) - previewHeight - margin;
    const maxTopBySection = sectionRect
      ? sectionRect.bottom - previewHeight - margin
      : maxTopByViewport;
    const minTopBySection = sectionRect ? Math.max(margin, sectionRect.top + margin) : margin;

    return {
      left: Math.max(margin, Math.min(mousePos.x + 30, (viewport.w || 9999) - previewWidth - margin)),
      top: Math.max(
        minTopBySection,
        Math.min(mousePos.y + 30, maxTopByViewport, maxTopBySection),
      ),
    };
  }, [mousePos.x, mousePos.y, viewport.h, viewport.w]);

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
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActiveProject(null)}
    >
      <div className="absolute inset-0 section-sheen pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-6 md:ml-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="works-heading"
              className="font-headline text-[12px] tracking-[0.7em] text-[#DFFF00] uppercase opacity-60"
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

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1 }}
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
              }}
              className="group relative border-b border-white/5 cursor-pointer transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#DFFF00]/50 focus-visible:outline-offset-4 mb-4"
            >
              <div className="absolute inset-x-0 -top-3 bottom-0 rounded-sm bg-[linear-gradient(100deg,rgba(223,255,0,0),rgba(223,255,0,0.1),rgba(80,120,255,0.055),rgba(223,255,0,0))] bg-[length:220%_100%] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100 group-hover:animate-gradient-shift" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#DFFF00]/0 via-[#DFFF00]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm" />
              <div className="absolute left-0 bottom-0 h-[1px] w-full bg-white/5" aria-hidden="true" />
              <TiltCard maxTilt={6} glareOpacity={0.0}>
                <motion.div
                  whileHover={{ x: -10 }}
                  transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                  style={{ willChange: 'transform' }}
                  className="py-5 md:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-headline tracking-[0.32em] text-white/45">
                      <span className="text-[#DFFF00]/70">{DISCIPLINE_LABELS[discipline]}</span>
                      <span className="h-[1px] w-6 bg-white/15" aria-hidden="true" />
                      <span>{role || project.category}</span>
                    </div>
                    <h3 className="mt-2 font-headline text-2xl md:text-[clamp(2rem,3.25vw,3.5rem)] tracking-[-0.02em] text-white bg-transparent transition-all duration-300 group-hover:text-[#DFFF00]">
                      {project.name}
                    </h3>
                    <motion.div
                      className="mt-3 h-[1px] w-12 bg-white/15"
                      initial={false}
                      animate={{ width: activeProject?.id === project.id ? 96 : 48, opacity: activeProject?.id === project.id ? 0.9 : 0.4 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <motion.span
                      className="font-headline text-[12px] tracking-[0.2em] text-white/70 hidden md:block"
                      animate={{ opacity: activeProject?.id === project.id ? 1 : 0.7, y: activeProject?.id === project.id ? 0 : 4 }}
                      transition={{ duration: 0.35 }}
                    >
                      {STATUS_LABELS[status]}
                    </motion.span>
                    <motion.span
                      className="font-headline text-[12px] tracking-widest text-white/70 group-hover:text-[#DFFF00] transition-colors"
                      animate={{ opacity: activeProject?.id === project.id ? 1 : 0.7, y: activeProject?.id === project.id ? 0 : 4 }}
                      transition={{ duration: 0.35, delay: 0.05 }}
                    >
                      {project.year}
                    </motion.span>
                    <div className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-[#DFFF00] transition-colors" />
                  </div>
                </motion.div>
              </TiltCard>
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
              const discipline = getProjectDiscipline(activeProject);

              if (showError || !activeProject.imageUrl) {
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
                  <img
                    key={src}
                    src={src}
                    alt={`Preview of ${activeProject.name}`}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700"
                    onError={() => handleImageError(activeProject.id)}
                    onLoad={() => handleImageLoad(activeProject.id)}
                  />
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
