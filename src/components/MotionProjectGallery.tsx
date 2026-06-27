"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Maximize2, Play, X } from 'lucide-react';
import type { Project } from '@/types/project';
import { getProjectStatus, STATUS_LABELS } from '@/lib/cms/project-meta';
import { VideoEmbed } from '@/components/content/VideoEmbed';

interface MotionProjectGalleryProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function MotionProjectGallery({ projects, onProjectClick }: MotionProjectGalleryProps) {
  const router = useRouter();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handlePrev = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
  };

  const handleNext = () => {
    setLightboxIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
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
              const hasVideoMedia = project.media?.some((m) => m.type === 'video');
              const hasVideo = project.videoUrl || hasVideoMedia;
              const firstImage = project.media?.find((m) => m.type === 'image')?.url;
              const imageUrl = project.imageUrl || firstImage;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: (index % 6) * 0.1 }}
                  className="group relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-black cursor-pointer"
                  onMouseEnter={() => setActiveProject(project)}
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
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : hasVideoMedia ? (
                    <VideoEmbed
                      url={project.media?.find((m) => m.type === 'video')?.url || ''}
                      className="absolute inset-0 w-full h-full [&_iframe]:!w-[120%] [&_iframe]:!h-[120%] [&_iframe]:!left-1/2 [&_iframe]:!top-1/2 [&_iframe]:!-translate-x-1/2 [&_iframe]:!-translate-y-1/2 [&_video]:object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      isBackground
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
                          {imageUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const imgIndex = project.media?.findIndex((m) => m.type === 'image') ?? 0;
                                handleOpenLightbox(imgIndex);
                              }}
                              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                              <Maximize2 className="w-4 h-4 text-white" />
                            </button>
                          )}
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

      <AnimatePresence>
        {lightboxOpen && projects[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={handleCloseLightbox}
          >
            <button
              type="button"
              onClick={handleCloseLightbox}
              className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors"
            >
              <span className="text-2xl text-white">&larr;</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors"
            >
              <span className="text-2xl text-white">&rarr;</span>
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const project = projects[lightboxIndex];
                const firstImage = project?.media?.find((m) => m.type === 'image')?.url;
                const imageUrl = project?.imageUrl || firstImage;
                if (!imageUrl) return null;
                return (
                  <img
                    src={imageUrl}
                    alt={project?.name || ''}
                    className="max-w-[90vw] max-h-[85vh] object-contain"
                  />
                );
              })()}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="font-headline text-2xl text-white mb-2">
                  {projects[lightboxIndex]?.name}
                </h3>
                <p className="font-headline text-[10px] tracking-[0.2em] text-white/50">
                  {projects[lightboxIndex]?.category} / {projects[lightboxIndex]?.year}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
