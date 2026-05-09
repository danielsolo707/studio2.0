"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'motion', label: 'Motion' },
  { value: 'code', label: 'Code' },
] as const;

type ProjectFilter = (typeof FILTERS)[number]['value'];

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
  const [selectedFilter, setSelectedFilter] = useState<ProjectFilter>('all');
  const rafRef = useRef<number | null>(null);

  const filteredProjects = projects.filter((project) => {
    if (selectedFilter === 'all') return true;
    return getProjectDiscipline(project) === selectedFilter;
  });

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

  const startPreviewLoad = useCallback((project: Project) => {
    if (!project.imageUrl) return;
    setLoadingPreviewId(project.id);
    setErrorPreviewId(null);
  }, []);

  return (
    <section
      id="works"
      aria-labelledby="works-heading"
      className="relative z-20 min-h-screen py-[12vh] px-6 md:px-16 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 flex flex-col gap-8 md:ml-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="works-heading"
              className="font-headline text-[14px] tracking-[0.8em] text-[#DFFF00] uppercase opacity-60"
            >
              SELECTED WORKS
            </h2>
            <p className="mt-4 max-w-xl text-base md:text-xl text-white/45 font-body leading-relaxed">
              Motion studies, practical code prototypes, and small data experiments.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Filter projects by discipline">
            {FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`h-9 px-4 border font-headline text-[9px] tracking-[0.25em] transition-colors ${
                    active
                      ? 'border-[#DFFF00] bg-[#DFFF00] text-black'
                      : 'border-white/10 text-white/50 hover:border-[#DFFF00]/50 hover:text-[#DFFF00]'
                  }`}
                  aria-pressed={active}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {filteredProjects.map((project) => {
          const status = getProjectStatus(project);

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
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
              className="group relative border-b border-white/5 cursor-pointer transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#DFFF00]/50 focus-visible:outline-offset-4 mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#DFFF00]/0 via-[#DFFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm" />
              <TiltCard maxTilt={6} glareOpacity={0.0}>
                <motion.div
                  whileHover={{ x: -10 }}
                  transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                  style={{ willChange: 'transform' }}
                  className="py-6 md:py-10 flex items-center justify-between gap-6 relative"
                >
                  <h3 className="font-headline text-2xl md:text-5xl tracking-tighter text-white bg-transparent transition-all duration-300 group-hover:text-[#DFFF00]">
                      {project.name}
                    </h3>

                  <div className="flex items-center gap-6">
                    <span className="font-headline text-[12px] tracking-[0.2em] text-white/70 hidden md:block">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="font-headline text-[12px] tracking-widest text-white/70 group-hover:text-[#DFFF00] transition-colors">
                      {project.year}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-[#DFFF00] transition-colors" />
                  </div>
                </motion.div>
              </TiltCard>
            </motion.div>
          );
        })}

        {filteredProjects.length === 0 ? (
          <div className="border border-white/10 py-16 px-6 text-center">
            <p className="font-headline text-xs tracking-[0.35em] text-white/45">
              NO PROJECTS IN THIS FILTER YET
            </p>
          </div>
        ) : null}

        <nav aria-label="Project pages" className="sr-only">
          {projects.map((p) => (
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
              left: Math.max(16, Math.min(mousePos.x + 30, (viewport.w || 9999) - 340)),
              top: Math.max(16, Math.min(mousePos.y + 30, (viewport.h || 9999) - 220)),
              pointerEvents: 'none',
              zIndex: 100,
            }}
            className="w-80 h-48 overflow-hidden border border-[#DFFF00]/20 bg-black shadow-[0_0_50px_rgba(223,255,0,0.1)] hidden md:block"
          >
            {(() => {
              const showError =
                errorPreviewId === activeProject.id ||
                failedImages.has(activeProject.id);
              const showLoading = loadingPreviewId === activeProject.id && !showError;
              const src = activeProject.imageUrl ? `${activeProject.imageUrl}` : '';
              const discipline = getProjectDiscipline(activeProject);

              if (showLoading) {
                return (
                  <div
                    className="w-full h-full preview-surface flex items-center justify-center"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="loader-ring" />
                  </div>
                );
              }

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
