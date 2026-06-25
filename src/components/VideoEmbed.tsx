"use client"

import React, { useMemo } from 'react';

interface VideoEmbedProps {
  url: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  grayscale?: boolean;
  isBackground?: boolean;
}

const VIMEO_REGEX = /(?:vimeo\.com\/(?:video\/)?)(\d+)(?:\/([\w]+))?/;

function parseVimeoUrl(url: string): { id: string; hash?: string } | null {
  const match = url.match(VIMEO_REGEX);
  if (!match) return null;
  return { id: match[1], hash: match[2] };
}

function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/i.test(url);
}

export function VideoEmbed({
  url,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = false,
  controls = true,
  preload = 'metadata',
  poster,
  className = '',
  style,
  grayscale = false,
  isBackground = false,
}: VideoEmbedProps) {
  const vimeoInfo = useMemo(() => parseVimeoUrl(url), [url]);

  if (vimeoInfo) {
    const params = new URLSearchParams();
    if (isBackground) {
      params.set('background', '1');
    } else {
      const effectiveAutoplay = autoPlay || muted;
      params.set('autoplay', effectiveAutoplay ? '1' : '0');
      params.set('muted', muted ? '1' : '0');
      params.set('loop', loop ? '1' : '0');
      params.set('controls', controls ? '1' : '0');
      params.set('playsinline', playsInline ? '1' : '0');
      params.set('title', '0');
      params.set('byline', '0');
      params.set('portrait', '0');
    }
    if (vimeoInfo.hash) {
      params.set('h', vimeoInfo.hash);
    }

    const embedUrl = `https://player.vimeo.com/video/${vimeoInfo.id}?${params.toString()}`;

    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          title="Video player"
        />
      </div>
    );
  }

  return (
    <video
      src={url}
      className={className}
      style={style}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      preload={preload}
      poster={poster}
    />
  );
}
