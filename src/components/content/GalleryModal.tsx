"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer, type VideoMediaItem } from '@/components/content/VideoPlayer';

type GalleryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: VideoMediaItem[];
  initialIndex: number;
  isIOS?: boolean;
  projectName?: string;
};

export function GalleryModal({ isOpen, onClose, items, initialIndex, isIOS = false, projectName }: GalleryModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const closeSafe = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeSafe();
      if (e.key === 'ArrowLeft') setIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      if (e.key === 'ArrowRight') setIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSafe, items.length]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const current = isOpen && items.length > 0 ? items[index] : null;
  const goPrev = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);
  const goNext = useCallback(() => {
    setIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="gallery-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
        onClick={closeSafe}
      >
        <button
          onClick={closeSafe}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50"
          aria-label="Close gallery"
        >
          <X size={32} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-3 md:left-8 text-white/60 hover:text-[#DFFF00] transition-colors z-50"
          aria-label="Previous media"
        >
          <ChevronLeft size={36} className="md:w-12 md:h-12" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-3 md:right-8 text-white/60 hover:text-[#DFFF00] transition-colors z-50"
          aria-label="Next media"
        >
          <ChevronRight size={36} className="md:w-12 md:h-12" />
        </button>

        <div
          className="relative w-full h-full p-4 md:p-12 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {current.type === 'image' ? (
            <img
              src={current.url}
              alt={`Gallery item ${index + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              loading="lazy"
            />
          ) : (
            <div className="w-full max-w-6xl">
              <VideoPlayer
                items={items}
                initialIndex={index}
                poster={current.thumbUrl}
                title={projectName}
                autoplay
                showCounter
              />
            </div>
          )}

          {current.type === 'image' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-headline text-xs tracking-widest flex items-center gap-3">
              <span className="px-2 py-1 rounded-full border border-white/15 text-white/70 uppercase">
                {current.type}
              </span>
              <span className="text-white/40">{index + 1} / {items.length}</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
