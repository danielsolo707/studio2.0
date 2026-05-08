import Link from 'next/link';

export const metadata = {
  title: 'Arcade',
  robots: { index: false, follow: false },
};

const games = [
  {
    href: '/arcade/2048',
    title: '2048',
    description: 'Classic 2048 with modern design',
    accent: '#ff9f43',
  },
  {
    href: '/arcade/synesthesia',
    title: 'Synesthesia Experience',
    description: 'Interactive color and sound experience (HTML)',
    accent: '#DFFF00',
  },
] as const;

export default function ArcadeIndexPage() {
  return (
    <main className="min-h-screen bg-[#030305] text-white px-6 py-12 md:py-16">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl tracking-tight">ARCADE</h1>
          <p className="mt-2 text-sm text-white/60">Choose a game</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-headline tracking-[0.3em] text-white/70 hover:text-[#DFFF00] transition-colors border border-white/15 px-4 py-2 rounded-full"
          aria-label="Back to home"
        >
          ← BACK HOME
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {games.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
          >
            <div
              className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
              style={{ background: g.accent }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-headline text-xl tracking-tight">{g.title}</h2>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: g.accent }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-sm text-white/60">{g.description}</p>
              <p className="mt-6 text-xs font-headline tracking-[0.25em] text-white/50 group-hover:text-white/70 transition-colors">
                PLAY →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

