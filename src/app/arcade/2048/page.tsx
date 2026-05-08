import Link from 'next/link';
import { Arcade2048 } from '@/components/Arcade2048';

export const metadata = {
  title: '2048 Arcade',
  robots: { index: false, follow: false },
};

export default function Arcade2048Page() {
  return (
    <main className="min-h-screen bg-[#030305] text-white px-6 py-12 md:py-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/arcade"
          className="inline-flex items-center gap-2 text-xs font-headline tracking-[0.3em] text-white/70 hover:text-[#ff9f43] transition-colors border border-white/15 px-4 py-2 rounded-full"
          aria-label="Back to arcade"
        >
          ← BACK TO ARCADE
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-headline tracking-[0.3em] text-white/60 hover:text-[#DFFF00] transition-colors"
          aria-label="Back to home"
        >
          HOME
        </Link>
      </div>
      <Arcade2048 />
    </main>
  );
}

