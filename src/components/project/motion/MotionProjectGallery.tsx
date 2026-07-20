"use client"

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import type { Project } from '@/types/project';
import { getProjectStatus, STATUS_LABELS } from '@/lib/cms/project-meta';

const VIMEO_ID = /(?:vimeo\.com\/(?:video\/)?)(\d+)/i;

function getVideoPoster(url: string, explicitPoster?: string): string {
  if (explicitPoster) return explicitPoster;
  const match = url.match(VIMEO_ID);
  return match ? `https://vumbnail.com/${match[1]}.jpg` : '';
}

interface MotionProjectGalleryProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function MotionProjectGallery({ projects, onProjectClick }: MotionProjectGalleryProps) {
  const router = useRouter();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleProjectClick = useCallback(
    (project: Project) => {
      if (onProjectClick) {
        onProjectClick(project);
        return;
      }
      router.push(`/projects/${project.id}`);
    },
    [onProjectClick, router],
  );

  return (
    <section className="min-h-screen bg-[#0a0a0c]">
        <div className="max-w-[1920px] mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[3px] bg-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {projects.map((project, index) => {
              const status = getProjectStatus(project);
              const firstVideo = project.media?.find((m) => m.type === 'video');
              const videoUrl = project.videoUrl || firstVideo?.url || '';
              const hasVideo = Boolean(videoUrl);
              const firstImage = project.media?.find((m) => m.type === 'image')?.url;
              const imageUrl = project.imageUrl || firstImage;
              const posterUrl = imageUrl || getVideoPoster(videoUrl, firstVideo?.thumbUrl);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: (index % 6) * 0.1 }}
                  className="group relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-black cursor-pointer"
                  onMouseEnter={() => {
                    setActiveProject(project);
                    router.prefetch(`/projects/${project.id}`);
                  }}
                  onMouseLeave={() => setActiveProject(null)}
                  onClick={() => handleProjectClick(project)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${project.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProjectClick(project);
                    }
                  }}
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={project.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#030305] via-black to-[#101205]" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {hasVideo && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {activeProject?.id === project.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-0 left-0 right-0 p-6"
                      >
                        <h3 className="font-headline text-xl md:text-2xl text-white tracking-tight mb-2">
                          {project.name}
                        </h3>
                        <p className="font-headline text-[10px] tracking-[0.2em] text-white/50 mb-3">
                          {STATUS_LABELS[status]} / {project.year}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-[10px] tracking-[0.15em] text-[#DFFF00]">
                            VIEW PROJECT
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {projects.length === 0 && (
            <div className="py-32 text-center">
              <p className="font-headline text-[12px] tracking-[0.4em] text-white/30">
                NO MOTION PROJECTS YET
              </p>
            </div>
          )}
        </div>
    </section>
  );
}
