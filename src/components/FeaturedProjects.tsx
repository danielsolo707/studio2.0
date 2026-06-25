"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from '@/lib/project-meta';

interface FeaturedProjectsProps {
  projects: Project[];
  maxProjects?: number;
}

export function FeaturedProjects({ projects, maxProjects = 3 }: FeaturedProjectsProps) {
  const router = useRouter();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isTouch, setIsTouch] = useState(false);

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

  return (
    <section
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
              onMouseEnter={() => setActiveProject(project)}
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
              onFocus={() => setActiveProject(project)}
              onBlur={() => setActiveProject(null)}
              className="group relative border-b border-white/5 cursor-pointer transition-colors duration-300 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#DFFF00]/50 focus-visible:outline-offset-4 mb-4"
            >
              {/* Single lightweight hover wash (removed expensive blur-xl gradient) */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#DFFF00]/0 via-[#DFFF00]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm pointer-events-none" />
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

      {/* Preview slot — intentionally empty for future replacement */}
    </section>
  );
}
