import React from 'react';

export function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full border text-[10px] font-headline tracking-[0.3em] ${
        ok ? 'border-[#DFFF00]/60 text-[#DFFF00]' : 'border-red-500/50 text-red-300'
      }`}
    >
      {label}
    </span>
  );
}
