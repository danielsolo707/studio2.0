"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/project';
import { GalleryModal } from '@/components/GalleryModal';

/** Client-side UI for an individual project page */
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

  // Deduplicate by url to avoid double entries when hero is also in media
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
  const heroModalIndex = orderedGallery.findIndex((m) => m.url === heroItem?.url);

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

  return (
    <main className="min-h-screen bg-[#030305]">
      {/* --- Hero image --- */}
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
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#030305] via-black/40 to-transparent">
            <div className="text-center">
              <div className="text-[#DFFF00] font-headline text-lg tracking-widest mb-2">
                IMAGE
              </div>
              <div className="text-white/40 font-body text-sm">UNABLE TO LOAD</div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-end md:items-center justify-between px-6 md:px-12 pb-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#DFFF00] font-headline">SELECTED WORK</p>
            <h1 className="font-headline text-3xl md:text-6xl text-white tracking-tight mt-2">{project.name}</h1>
            <p className="text-white/60 font-body mt-2">{project.category} • {project.year}</p>
          </div>
        </div>
      </motion.div>

      {/* --- Content --- */}
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

          <motion.dl
            className="flex flex-wrap gap-8 md:gap-16 pt-12 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
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
                    viewport={{ once: true, margin: "-10%" }}
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
