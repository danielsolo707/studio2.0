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
      params.set('autoplay', autoPlay ? '1' : '0');
      params.set('muted', muted ? '1' : '0');
      params.set('loop', loop ? '1' : '0');
      params.set('controls', controls ? '1' : '0');
      params.set('playsinline', playsInline ? '1' : '0');
    }
    if (vimeoInfo.hash) {
      params.set('h', vimeoInfo.hash);
    }

    const embedUrl = `https://player.vimeo.com/video/${vimeoInfo.id}?${params.toString()}`;

    return (
      <iframe
        src={embedUrl}
        className={className}
        style={{
          ...(grayscale ? { filter: 'grayscale(1)' } : {}),
          ...style,
        }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Video player"
      />
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
