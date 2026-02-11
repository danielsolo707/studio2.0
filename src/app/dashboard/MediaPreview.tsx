"use client";
import { useEffect, useState } from 'react';

type Props = {
  url: string;
  type: 'image' | 'video';
  label: string;
};

export function MediaPreview({ url, type, label }: Props) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const previewThumb = (
    <div className="w-48 h-28 bg-black/80 border border-white/10 overflow-hidden rounded shadow-[0_0_20px_rgba(223,255,0,0.1)]">
      {type === 'video' ? (
        <video
          src={url}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay
        />
      ) : (
        <img
          src={url}
          alt="media preview"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={(e) => setHover({ x: e.clientX + 12, y: e.clientY + 12 })}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => setHover({ x: e.clientX + 12, y: e.clientY + 12 })}
        className="text-xs text-[#DFFF00] underline decoration-dotted decoration-[#DFFF00]/60 hover:text-[#d4ff00] transition-colors text-left"
      >
        {label}
      </button>

      {hover && (
        <div
          className="fixed z-[250] pointer-events-none"
          style={{ left: hover.x, top: hover.y }}
        >
          {previewThumb}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-[#DFFF00] font-headline text-xs tracking-[0.3em] bg-black/50 px-3 py-1 border border-white/20 rounded"
            >
              CLOSE
            </button>
            {type === 'video' ? (
              <video
                src={url}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain bg-black"
              />
            ) : (
              <img
                src={url}
                alt="media full preview"
                className="w-full max-h-[80vh] object-contain bg-black"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
