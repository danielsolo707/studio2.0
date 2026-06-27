"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, BookOpen, ExternalLink, Github, PlayCircle, Terminal, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/project';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { FilmGrain } from '@/components/effects/film-grain';
import { GalleryModal } from '@/components/content/GalleryModal';
import { VideoEmbed } from '@/components/content/VideoEmbed';
import { IDEHeader } from '@/components/project/ide-header';
import { JSDocOverview } from '@/components/project/jsdoc-overview';
import { CodeAccordion } from '@/components/project/code-accordion';
import { TechSpecsGrid } from '@/components/project/tech-specs-grid';
import { ParallaxGallery } from '@/components/project/parallax-gallery';
import { TerminalBackButton } from '@/components/project/terminal-back-button';
import {
  DISCIPLINE_LABELS,
  getProjectDiscipline,
  getProjectLinks,
  getProjectRole,
  getProjectStatus,
  LINK_TYPE_LABELS,
  STATUS_LABELS,
} from '@/lib/cms/project-meta';

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loadedSet, setLoadedSet] = useState<Set<string>>(new Set());
  const [isIOS, setIsIOS] = useState(false);

  const isCode = getProjectDiscipline(project) === 'code';

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
  }, []);

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
    if (type === 'kaggle') return <BarChart3 size={16} />;
    return <ExternalLink size={16} />;
  };

  if (isCode) {
    const techSpecs = [
      { key: "DISCIPLINE", value: DISCIPLINE_LABELS[discipline], isHighlighted: true },
      { key: "ROLE", value: role },
      { key: "YEAR", value: project.year },
      { key: "CATEGORY", value: project.category || 'N/A' },
      { key: "TOOLS", value: project.tools?.split(' / ').join(' / ') || 'N/A' },
    ];

    const accordionItems = [
      {
        functionName: "getChallenge",
        content: project.challenge || `// The main challenge was building a real-time
// collaboration system that could handle multiple
// users editing tasks simultaneously without
// conflicts or data loss.

const challenges = [
  "Real-time sync across devices",
  "Optimistic UI updates",
  "Conflict resolution",
  "Performance at scale"
];`,
      },
      {
        functionName: "implementSolution",
        content: project.solution || `// Solution implemented using WebSocket connections
// with operational transformation for conflict-free
// collaborative editing.

const techStack = {
  realtime: "Socket.IO",
  state: "Zustand + Immer",
  db: "MongoDB Change Streams",
  cache: "React Query"
};

// Result: <50ms sync latency worldwide`,
      },
    ];

    const galleryImages = (orderedGallery
      .filter(m => m.type === 'image')
      .map(m => ({
        src: m.url,
        alt: `${project.name} view`,
        type: 'browser' as const
      }))).length > 0 
      ? orderedGallery
          .filter(m => m.type === 'image')
          .map(m => ({
            src: m.url,
            alt: `${project.name} view`,
            type: 'browser' as const
          }))
      : project.imageUrl 
        ? [{ src: project.imageUrl, alt: `${project.name} view`, type: 'browser' as const }]
        : [];

    const statusLabel = STATUS_LABELS[status] || status || 'Prototype';

    return (
      <main className="min-h-screen bg-background text-foreground">
        <FilmGrain />
        
        <IDEHeader projectSlug={project.id} projectName={project.name} />

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12">
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span className="text-lime">{">"}_</span>
              <span>~/projects/{project.id}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start justify-between gap-4">
              <div className="space-y-3 w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight font-mono uppercase break-words">
                  {project.name.replace(/ /g, "_")}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono">
                  <span className="text-lime">{project.category || 'Creative Code'}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{project.year}</span>
                  <span className="text-muted-foreground hidden sm:inline">•</span>
                  <span className="text-muted-foreground hidden sm:inline">{project.tools}</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:hidden">
                  {project.tools?.split(' / ').map((tech) => (
                    <span key={tech} className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="px-3 sm:px-4 py-1 sm:py-1.5 bg-lime/10 border border-lime/30 rounded-md text-lime text-xs font-mono"
              >
                {statusLabel}
              </motion.span>
            </div>
          </motion.section>

          <JSDocOverview 
            projectName={project.name}
            description={project.description || 'No description available.'}
            status={statusLabel}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap gap-4"
          >
            {links.map((link) => (
              <a
                key={`${link.type}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group flex items-center gap-2 
                  px-5 py-2.5 
                  bg-muted/50 border border-border 
                  rounded-lg
                  hover:border-lime hover:bg-lime/10
                  transition-all duration-300
                  font-mono text-sm
                "
              >
                {getLinkIcon(link.type)}
                <span className="text-foreground group-hover:text-lime transition-colors">
                  {link.label || LINK_TYPE_LABELS[link.type] || link.type}
                </span>
              </a>
            ))}
          </motion.div>

          <TechSpecsGrid specs={techSpecs} />

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
              <Folder className="w-4 h-4" />
              <span>LOGIC BREAKDOWN</span>
            </div>
            <CodeAccordion items={accordionItems} />
          </motion.section>

          {galleryImages.length > 0 && (
            <ParallaxGallery images={galleryImages} />
          )}

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="pt-8 md:pt-12 border-t border-border space-y-6 md:space-y-8"
          >
            <div className="font-mono text-xs sm:text-sm overflow-x-auto">
              <span className="text-[#569CD6]">const</span>
              <span className="text-foreground"> project</span>
              <span className="text-foreground"> = </span>
              <span className="text-foreground">{"{ "}</span>
              <span className="text-[#9CDCFE]">id</span>
              <span className="text-foreground">: </span>
              <span className="text-[#CE9178]">{`"${project.id}"`}</span>
              <span className="text-foreground">, </span>
              <span className="text-[#9CDCFE]">status</span>
              <span className="text-foreground">: </span>
              <span className="text-lime">true</span>
              <span className="text-foreground">{" }"}</span>
            </div>

            <div className="flex justify-center">
              <TerminalBackButton />
            </div>
          </motion.footer>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030305]">
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
              <dd className="font-headline text-lg text-white">{STATUS_LABELS[status] || status}</dd>
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
            {project.details && (
              <div className="min-w-[200px] border-t border-white/10 pt-6 mt-4">
                <dt className="text-[10px] uppercase tracking-[0.5em] text-[#DFFF00] mb-4 font-headline">
                  DETAILS
                </dt>
                <dd className="font-body text-base text-white/70 max-w-xs">{project.details}</dd>
              </div>
            )}
          </motion.dl>

          {project.description && (
            <motion.div
              className="pt-12 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="font-body text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl">
                {project.description}
              </p>
            </motion.div>
          )}

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
                        <div className="relative w-full aspect-video bg-black/50">
                          <VideoEmbed
                            url={m.url}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls
                            preload="metadata"
                            poster={m.thumbUrl || project.imageUrl || undefined}
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

      <GalleryModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={orderedGallery}
        initialIndex={galleryIndex}
        isIOS={isIOS}
        projectName={project.name}
      />
    </main>
  );
}