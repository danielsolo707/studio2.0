"use client";

import React from 'react';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/core/utils';

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'w-full px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#d4ff00] transition-colors disabled:opacity-60',
        className,
      )}
    >
      {pending ? 'SAVING...' : children}
    </button>
  );
}
