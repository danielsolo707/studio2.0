"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Code2, ExternalLink, Github, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/project';
import { GalleryModal } from '@/components/GalleryModal';
import {
  DISCIPLINE_LABELS,
  getProjectDiscipline,
  getProjectLinks,
  getProjectRole,
  getProjectStatus,
  LINK_TYPE_LABELS,
  STATUS_LABELS,
} from '@/lib/project-meta';

export function ProjectDetailClient({ project }: { project: Project }) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [loadedSet, setLoadedSet] = useState<Set<string>>(new Set());

  const baseGallery = project.media && project.media.length > 0
    ? project.media
    : [
        ...(project.imageUrl ? [{ type: 'image' as const, url: project.imageUrl }] : []),
        ...(project.videoUrl ? [{ type: 'video' as const, url: project.videoUrl }] : []),
      ];

  const seen = new Set<string>();
  const gallery = baseGallery.filter((m) => {
    if (seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });

  const heroIndex = gallery.findIndex((m) => m.type === 'video');
  const safeHeroIndex = heroIndex !== -1 ? heroIndex : 0;
  const heroItem = gallery[safeHeroIndex];

  const orderedGallery = heroItem
    ? [heroItem, ...gallery.filter((_, i) => i !== safeHeroIndex)]
    : gallery;

  const discipline = getProjectDiscipline(project);
  const status = getProjectStatus(project);
  const role = getProjectRole(project);
  const links = getProjectLinks(project);
  const proofPoints = [
    { label: 'Objective', value: project.objective },
    { label: 'Approach', value: project.approach },
    { label: 'Outcome', value: project.outcome },
    { label: 'Next Step', value: project.nextStep },
  ].filter((item) => item.value && item.value.trim().length > 0);

  const handleOpenGallery = (index: number = 0) => {
    setGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const handleLoaded = (url: string) => {
    setLoadedSet((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/#works');
    }
  };

  const getLinkIcon = (type: string) => {
    if (type === 'github') return <Github size={16} />;
    if (type === 'notebook') return <BookOpen size={16} />;
    if (type === 'video') return <PlayCircle size={16} />;
    return <ExternalLink size={16} />;
  };

  return (
    <main className="min-h-screen bg-[#030305]">
      <motion.div
        className="relative w-full aspect-video md:h-[70vh] overflow-hidden bg-black/50"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {heroItem && heroItem.type === 'video' ? (
          <video
            src={heroItem.url}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : imageLoaded && (heroItem?.thumbUrl || heroItem?.url || project.imageUrl) ? (
          <>
            {(() => {
              const src = heroItem?.thumbUrl || heroItem?.url || project.imageUrl;
              if (!src) return null;
              return (
                <Image
                  src={src}
                  alt={project.name}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={() => setImageLoaded(false)}
                  onLoadingComplete={() => heroItem?.url && handleLoaded(heroItem.url)}
                />
              );
            })()}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#030305] via-black to-[#101205]">
            <div className="text-center px-6">
              <Code2 className="w-12 h-12 mx-auto text-[#DFFF00]/80 mb-5" strokeWidth={1.4} />
              <div className="text-[#DFFF00] font-headline text-sm tracking-[0.4em] mb-3">
                {DISCIPLINE_LABELS[discipline]}
              </div>
              <div className="text-white/45 font-body text-sm max-w-sm leading-relaxed">
                {role}
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-end md:items-center justify-between px-6 md:px-12 pb-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#DFFF00] font-headline">SELECTED WORK</p>
            <h1 className="font-headline text-3xl md:text-6xl text-white tracking-tight mt-2">{project.name}</h1>
            <p className="text-white/60 font-body mt-2">
              {DISCIPLINE_LABELS[discipline]} / {project.year}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 p-6 md:p-24 bg-[#030305]">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 font-headline text-[10px] tracking-[0.4em] text-white hover:text-[#DFFF00] transition-colors mb-12"
        >
          <ArrowLeft size={16} /> BACK
        </button>

        <div className="max-w-5xl space-y-12">
          <motion.h1
            className="font-headline text-4xl md:text-[8vw] leading-none tracking-tighter italic text-white"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {project.name}
          </motion.h1>

          <motion.p
            className="font-body text-xl md:text-3xl text-white/60 max-w-3xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {project.description}
          </motion.p>

          {links.length > 0 ? (
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {links.map((link) => (
                <a
                  key={`${link.type}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 border border-[#DFFF00]/40 px-4 font-headline text-[10px] tracking-[0.25em] text-[#DFFF00] transition-colors hover:bg-[#DFFF00] hover:text-black"
                >
                  {getLinkIcon(link.type)}
                  {link.label || LINK_TYPE_LABELS[link.type]}
                </a>
              ))}
            </motion.div>
          ) : null}

          <motion.dl
            className="flex flex-wrap gap-8 md:gap-16 pt-12 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div>
              <dt className="text-[10px] uppercase tracking-[0.5em] text-[#DFFF00] mb-4 font-headline">
                DISCIPLINE
              </dt>
              <dd className="font-headline text-lg text-white">{DISCIPLINE_LABELS[discipline]}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.5em] text-[#DFFF00] mb-4 font-headline">
                STATUS
              </dt>
              <dd className="font-headline text-lg text-white">{STATUS_LABELS[status]}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.5em] text-[#DFFF00] mb-4 font-headline">
                ROLE
              </dt>
              <dd className="font-headline text-lg text-white">{role}</dd>
            </div>
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
          </motion.dl>

          {proofPoints.length > 0 ? (
            <motion.section
              className="grid gap-4 md:grid-cols-2 pt-12 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              aria-label="Project process"
            >
              {proofPoints.map((item) => (
                <div key={item.label} className="border border-white/10 p-5 bg-white/[0.02]">
                  <h2 className="font-headline text-[10px] tracking-[0.35em] text-[#DFFF00] mb-4 uppercase">
                    {item.label}
                  </h2>
                  <p className="font-body text-sm md:text-base text-white/60 leading-relaxed">
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.section>
          ) : null}

          {orderedGallery.length > 0 ? (
            <div className="pt-24 border-t border-white/10">
              <p className="text-[10px] tracking-[0.4em] text-[#DFFF00] font-headline mb-12 text-center">
                PROJECT GALLERY
              </p>
              <div className="flex flex-col gap-12 md:gap-32">
                {orderedGallery.map((m, idx) => {
                  const loaded = loadedSet.has(m.url) || (m.thumbUrl && loadedSet.has(m.thumbUrl));
                  const displayUrl = m.thumbUrl || m.url;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-10%' }}
                      transition={{ duration: 0.8 }}
                      key={m.url + idx}
                      className="w-full relative cursor-pointer group"
                      onClick={() => handleOpenGallery(idx)}
                    >
                      <div className="relative w-full overflow-hidden rounded-sm bg-gradient-to-br from-white/5 to-white/0">
                        {!loaded && (
                          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
                        )}
                        {m.type === 'image' ? (
                          <img
                            src={displayUrl}
                            data-full={m.url}
                            alt={`${project.name} view ${idx + 1}`}
                            className="w-full h-auto object-contain bg-black/20 hover:opacity-90 transition-opacity"
                            loading="lazy"
                            onLoad={(e) => {
                              const full = (e.currentTarget.dataset.full as string) || m.url;
                              handleLoaded(full);
                              if (displayUrl !== full) handleLoaded(displayUrl);
                            }}
                          />
                        ) : (
                          <div className="relative w-full aspect-video bg-black/20">
                            <video
                              src={m.url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              autoPlay
                              onLoadedData={() => handleLoaded(m.url)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 duration-300">
                              <PlayCircle className="text-white/80 w-20 h-20 drop-shadow-lg" strokeWidth={1} />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        items={orderedGallery}
        initialIndex={galleryIndex}
      />
    </main>
  );
}
