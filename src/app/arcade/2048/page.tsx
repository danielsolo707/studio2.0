import Link from 'next/link';
import { Arcade2048 } from '@/components/Arcade2048';

export const metadata = {
  title: '2048 Arcade',
  robots: { index: false, follow: false },
};

export default function Arcade2048Page() {
  return (
    <main className="min-h-screen bg-[#030305] text-white px-6 py-12 md:py-16">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/arcade"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md px-4 py-2 border border-white/10 hover:border-[#ff9f43]/40 transition-colors duration-300"
          aria-label="Back to arcade"
        >
          <span
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(90deg, rgba(255,159,67,0.18), transparent 70%)' }}
            aria-hidden="true"
          />
          <span className="relative flex items-center justify-center w-5 h-5">
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-[6px] transition-opacity duration-300"
              style={{ background: '#ff9f43' }}
              aria-hidden="true"
            />
            <svg
              className="relative w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <path d="M10 3 L4 8 L10 13" />
              <path d="M4 8 H13" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </svg>
          </span>
          <span className="relative font-headline text-[10px] tracking-[0.35em] text-white/50 group-hover:text-[#ff9f43] transition-colors duration-300">
            ARCADE
          </span>
        </Link>
      </div>
      <Arcade2048 />
    </main>
  );
}

