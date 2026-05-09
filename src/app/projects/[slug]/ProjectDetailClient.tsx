"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Code2, ExternalLink, Github, PlayCircle, Terminal, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/project';
import {
  DISCIPLINE_LABELS,
  getProjectDiscipline,
  getProjectLinks,
  getProjectRole,
  getProjectStatus,
  LINK_TYPE_LABELS,
  STATUS_LABELS,
} from '@/lib/project-meta';

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loadedSet, setLoadedSet] = useState<Set<string>>(new Set());

  const isCode = getProjectDiscipline(project) === 'code';

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

  const parseProofPoints = (description: string) => {
    const points: { label: string; value: string }[] = [];
    const labels = ['Objective:', 'Approach:', 'Outcome:', 'Next Step:'];
    
    labels.forEach((label) => {
      const regex = new RegExp(`${label}[\\s\\n]([\\s\\S]*?)(?=${labels.join('|')}|$)`, 'i');
      const match = description.match(regex);
      if (match && match[1]?.trim()) {
        points.push({ label: label.replace(': ', ''), value: match[1].trim() });
      }
    });
    
    return points;
  };
  
  const proofPoints = parseProofPoints(project.description || '');

  const handleOpenGallery = (index: number = 0) => {
    setGalleryIndex(index);
    setLightboxOpen(true);
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

  // Code project styling
  if (isCode) {
    return (
      <main className="min-h-screen bg-[#0d1117]">
        {/* Header */}
        <div className="border-b border-[#30363d] bg-[#161b22]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 font-mono text-[12px] text-[#8b949e] hover:text-[#58a6ff] transition-colors"
            >
              <ArrowLeft size={14} /> cd ..
            </button>
          </div>
        </div>

        {/* Title Bar - No Hero Image */}
        <div className="bg-[#0d1117] border-b border-[#30363d]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-5 h-5 text-[#7ee787]" />
              <span className="font-mono text-[11px] text-[#8b949e]">~/projects/{project.id}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-mono text-2xl md:text-5xl text-[#e6edf3]">{project.name}</h1>
                <div className="flex items-center gap-3 mt-3 font-mono text-[12px] text-[#8b949e]">
                  <span className="text-[#79c0ff]">{project.category}</span>
                  <span className="text-[#6e7681]">/</span>
                  <span className="text-[#8b949e]">{project.year}</span>
                  <span className="text-[#6e7681]">•</span>
                  <span className="text-[#8b949e]">{project.tools}</span>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1.5 font-mono text-[11px] rounded ${
                status === 'case-study'
                  ? 'bg-[#238636]/20 text-[#7ee787]'
                  : status === 'prototype'
                  ? 'bg-[#1f6feb]/20 text-[#58a6ff]'
                  : 'bg-[#8b949e]/20 text-[#8b949e]'
              }`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid gap-8">
            {/* Description */}
            <div className="p-6 rounded-lg border border-[#30363d] bg-[#161b22]">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-4 h-4 text-[#58a6ff]" />
                <span className="font-mono text-[10px] text-[#8b949e] tracking-wider">PROJECT OVERVIEW</span>
              </div>
              <p className="font-mono text-sm text-[#c9d1d9] leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Links */}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    key={`${link.type}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-[#30363d] px-4 py-2 font-mono text-[12px] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#58a6ff] transition-colors rounded"
                  >
                    {getLinkIcon(link.type)}
                    {link.label || LINK_TYPE_LABELS[link.type]}
                  </a>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded bg-[#161b22] border border-[#30363d]">
                <span className="font-mono text-[9px] text-[#8b949e] block mb-1">DISCIPLINE</span>
                <span className="font-mono text-sm text-[#7ee787]">{DISCIPLINE_LABELS[discipline]}</span>
              </div>
              <div className="p-4 rounded bg-[#161b22] border border-[#30363d]">
                <span className="font-mono text-[9px] text-[#8b949e] block mb-1">ROLE</span>
                <span className="font-mono text-sm text-[#c9d1d9]">{role}</span>
              </div>
              <div className="p-4 rounded bg-[#161b22] border border-[#30363d]">
                <span className="font-mono text-[9px] text-[#8b949e] block mb-1">YEAR</span>
                <span className="font-mono text-sm text-[#c9d1d9]">{project.year}</span>
              </div>
              <div className="p-4 rounded bg-[#161b22] border border-[#30363d]">
                <span className="font-mono text-[9px] text-[#8b949e] block mb-1">CATEGORY</span>
                <span className="font-mono text-sm text-[#c9d1d9]">{project.category}</span>
              </div>
              <div className="p-4 rounded bg-[#161b22] border border-[#30363d]">
                <span className="font-mono text-[9px] text-[#8b949e] block mb-1">TOOLS</span>
                <span className="font-mono text-sm text-[#c9d1d9] truncate">{project.tools}</span>
              </div>
            </div>

            {/* Proof Points */}
            {proofPoints.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-4 h-4 text-[#58a6ff]" />
                  <span className="font-mono text-[10px] text-[#8b949e] tracking-wider">PROJECT DETAILS</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {proofPoints.map((point) => (
                    <div key={point.label} className="p-4 rounded bg-[#161b22] border border-[#30363d]">
                      <span className="font-mono text-[10px] text-[#58a6ff] block mb-2">
                        {point.label}:
                      </span>
                      <span className="font-mono text-sm text-[#c9d1d9]">
                        {point.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {orderedGallery.length > 0 && (
              <div className="pt-8 border-t border-[#30363d]">
                <div className="flex items-center gap-2 mb-6">
                  <FolderOpen className="w-4 h-4 text-[#58a6ff]" />
                  <span className="font-mono text-[10px] text-[#8b949e] tracking-wider">PROJECT GALLERY</span>
                </div>
                <div className="grid gap-6">
                  {orderedGallery.map((m, idx) => (
                    <motion.div
                      key={m.url + idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="relative cursor-pointer"
                      onClick={() => handleOpenGallery(idx)}
                    >
                      <div className="relative w-full overflow-hidden rounded border border-[#30363d] bg-[#161b22]">
                        {m.type === 'image' ? (
                          <img
                            src={m.url}
                            alt={`${project.name} view ${idx + 1}`}
                            className="w-full h-auto object-contain"
                            loading="lazy"
                            onLoad={() => handleLoaded(m.url)}
                          />
                        ) : (
                          <div className="relative w-full aspect-video bg-black">
                            <video
                              src={m.url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              autoPlay
                              onLoadedData={() => handleLoaded(m.url)}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[#30363d]">
            <p className="font-mono text-[11px] text-[#6e7681]">
              <span className="text-[#7ee787]">const</span> project = {'{'} id: <span className="text-[#a5d6ff]">"{project.id}"</span>, status: <span className="text-[#7ee787]">true</span> {'}'}
            </p>
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && orderedGallery[galleryIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full border border-[#30363d] flex items-center justify-center hover:border-[#58a6ff] transition-colors"
            >
              <FolderOpen className="w-6 h-6 text-white" />
            </button>
            <motion.div
              key={galleryIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {orderedGallery[galleryIndex].type === 'image' ? (
                <img
                  src={orderedGallery[galleryIndex].url}
                  alt={project.name}
                  className="max-w-[90vw] max-h-[85vh] object-contain"
                />
              ) : (
                <video
                  src={orderedGallery[galleryIndex].url}
                  className="max-w-[90vw] max-h-[85vh] object-contain"
                  controls
                  autoPlay
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </main>
    );
  }

  // Original design for non-code projects (motion, etc)
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
                <img
                  src={src}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImageLoaded(false)}
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
            >
              {proofPoints.map((item) => (
                <div key={item.label} className="border border-white/10 p-5 bg-white/[0.02]">
                  <h2 className="font-headline text-[10px] tracking-[0.35em] text-[#DFFF00] mb-4">
                    {item.label}:
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
              <div className="flex flex-col gap-12">
                {orderedGallery.map((m, idx) => (
                  <motion.div
                    key={m.url + idx}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full cursor-pointer"
                    onClick={() => handleOpenGallery(idx)}
                  >
                    <div className="relative w-full overflow-hidden">
                      {m.type === 'image' ? (
                        <img
                          src={m.url}
                          alt={`${project.name} view ${idx + 1}`}
                          className="w-full h-auto object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="relative w-full aspect-video">
                          <video
                            src={m.url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}