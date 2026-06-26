"use client";

import React from 'react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#d4ff00] transition-colors disabled:opacity-60"
    >
      {pending ? 'SAVING...' : children}
    </button>
  );
}
