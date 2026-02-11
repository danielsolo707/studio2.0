"use client"

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <h2 className="font-headline text-2xl text-[#DFFF00] tracking-wider">
          SOMETHING WENT WRONG
        </h2>
        <p className="font-body text-sm text-white/50">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="px-8 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#DFFF00]/80 transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
