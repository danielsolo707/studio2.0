import Link from 'next/link';

export const metadata = {
  title: 'Synesthesia Experience — Arcade',
  robots: { index: false, follow: false },
};

export default function SynesthesiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="px-6 py-6">
        <Link
          href="/arcade"
          className="inline-flex items-center gap-2 text-xs font-headline tracking-[0.3em] text-white/70 hover:text-[#DFFF00] transition-colors border border-white/15 px-4 py-2 rounded-full"
          aria-label="Back to arcade"
        >
          ← BACK TO ARCADE
        </Link>
      </div>

      <div className="h-[calc(100vh-88px)] w-full">
        <iframe
          src="/arcade/synesthesia.html"
          title="Synesthesia Experience"
          className="h-full w-full border-0"
          allow="autoplay; fullscreen"
        />
      </div>
    </main>
  );
}
