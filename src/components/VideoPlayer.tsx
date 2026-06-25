"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react';
import { VideoEmbed } from '@/components/VideoEmbed';

export interface VideoMediaItem {
  type: 'image' | 'video';
  url: string;
  thumbUrl?: string;
}

interface VideoPlayerProps {
  items: VideoMediaItem[];
  initialIndex?: number;
  poster?: string;
  title?: string;
  className?: string;
  autoPlayHero?: boolean;
  autoplay?: boolean;
  showCounter?: boolean;
}

const VIMEO_REGEX = /(?:vimeo\.com\/(?:video\/)?)(\d+)(?:\/([\w]+))?/;

function isVimeo(url: string): boolean {
  return /vimeo\.com/i.test(url);
}

function getVimeoId(url: string): string | null {
  const m = url.match(VIMEO_REGEX);
  return m ? m[1] : null;
}

function getVimeoThumb(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const id = getVimeoId(url);
    if (!id) return resolve(null);
    resolve(`https://vumbnail.com/${id}.jpg`);
  });
}

export function VideoPlayer({
  items,
  initialIndex = 0,
  poster,
  title,
  className = '',
  autoPlayHero = false,
  autoplay = false,
  showCounter = true,
}: VideoPlayerProps) {
  const videoItems = items.filter((m) => m.type === 'video');
  const [index, setIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, videoItems.length - 1)),
  );
  const [playing, setPlaying] = useState(autoPlayHero || autoplay);
  const [fullscreen, setFullscreen] = useState(false);
  const [vimeoThumbs, setVimeoThumbs] = useState<Record<string, string>>({});
  const [thumbErrors, setThumbErrors] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const current = videoItems[index];
  const hasMultiple = videoItems.length > 1;

  useEffect(() => {
    if (autoplay && localVideoRef.current) {
      localVideoRef.current.play().catch(() => {});
    }
  }, [autoplay, index]);

  useEffect(() => {
    let cancelled = false;
    videoItems.forEach((m) => {
      if (isVimeo(m.url) && !vimeoThumbs[m.url] && !thumbErrors.has(m.url)) {
        getVimeoThumb(m.url).then((thumb) => {
          if (cancelled) return;
          if (thumb) setVimeoThumbs((prev) => ({ ...prev, [m.url]: thumb }));
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [videoItems, vimeoThumbs, thumbErrors]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev < videoItems.length - 1 ? prev + 1 : 0));
    setPlaying(autoplay);
  }, [videoItems.length, autoplay]);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : videoItems.length - 1));
    setPlaying(autoplay);
  }, [videoItems.length, autoplay]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight' && hasMultiple) goNext();
      if (e.key === 'ArrowLeft' && hasMultiple) goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, hasMultiple, goNext, goPrev]);

  useEffect(() => {
    if (!fullscreen) {
      document.body.style.overflow = '';
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    if (localVideoRef.current) {
      localVideoRef.current.play().catch(() => {});
    }
  }, []);

  const handleThumbError = useCallback((url: string) => {
    setThumbErrors((prev) => new Set([...prev, url]));
  }, []);

  const handleFullscreen = useCallback(() => {
    if (fullscreen) {
      setFullscreen(false);
      return;
    }
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      setFullscreen(true);
    }
  }, [fullscreen]);

  useEffect(() => {
    const onFsChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (!current) return null;

  const currentIsVimeo = isVimeo(current.url);
  const currentThumb =
    current.thumbUrl ||
    vimeoThumbs[current.url] ||
    poster ||
    '';

  const videoContent = playing ? (
    currentIsVimeo ? (
      <VideoEmbed
        url={current.url}
        autoPlay
        muted={autoPlayHero}
        loop={autoPlayHero}
        playsInline
        controls
        className="w-full h-full"
      />
    ) : (
      <video
        ref={localVideoRef}
        src={current.url}
        className="w-full h-full object-contain bg-black"
        controls
        autoPlay
        loop={autoPlayHero}
        muted={autoPlayHero}
        playsInline
        poster={currentThumb || poster || undefined}
      />
    )
  ) : (
    <button
      type="button"
      onClick={handlePlay}
      className="group relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
      aria-label={`Play ${title || 'video'}`}
    >
      {currentThumb && !thumbErrors.has(current.url) ? (
        <img
          src={currentThumb}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => handleThumbError(current.url)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#030305] via-black to-[#101205]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative z-10 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/80 bg-black/40 backdrop-blur-sm group-hover:border-[#DFFF00] group-hover:bg-[#DFFF00]/20 group-hover:scale-110 transition-all duration-300"
      >
        <Play className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:text-[#DFFF00] fill-white/80 group-hover:fill-[#DFFF00] ml-1" />
      </motion.div>
      {title && (
        <div className="absolute bottom-4 left-4 right-4 text-left">
          <p className="font-headline text-[10px] tracking-[0.4em] text-[#DFFF00] opacity-80">
            {currentIsVimeo ? 'VIMEO' : 'VIDEO'} {String(index + 1).padStart(2, '0')}
          </p>
        </div>
      )}
    </button>
  );

  const playerUI = (
    <div
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden group/player ${
        fullscreen ? 'h-full' : 'aspect-video'
      } ${className}`}
    >
      <div className="absolute inset-0">{videoContent}</div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/50 backdrop-blur-sm border border-white/15 text-white/80 hover:text-[#DFFF00] hover:border-[#DFFF00]/50 transition-all opacity-0 group-hover/player:opacity-100"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/50 backdrop-blur-sm border border-white/15 text-white/80 hover:text-[#DFFF00] hover:border-[#DFFF00]/50 transition-all opacity-0 group-hover/player:opacity-100"
            aria-label="Next video"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {playing && (
        <button
          type="button"
          onClick={handleFullscreen}
          className="absolute bottom-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm border border-white/15 text-white/80 hover:text-[#DFFF00] hover:border-[#DFFF00]/50 transition-all opacity-0 group-hover/player:opacity-100"
          aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <Maximize className="w-4 h-4" />
        </button>
      )}

      {showCounter && hasMultiple && (
        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-black/60 backdrop-blur-sm border border-white/10 font-headline text-[10px] tracking-widest text-white/70">
          {index + 1} / {videoItems.length}
        </div>
      )}

      {fullscreen && (
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="absolute top-4 left-4 z-30 w-10 h-10 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 hover:text-[#DFFF00] transition-all"
          aria-label="Close fullscreen"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
        >
          <div className="w-full h-full max-w-[100vw] max-h-[100vh] p-0 md:p-4">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-full h-full max-h-full">{playerUI}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return playerUI;
}
