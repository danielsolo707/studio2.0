/** Static site footer — rendered as a Server Component */
export function Footer() {
  return (
    <footer className="relative z-20 w-full flex flex-col md:flex-row justify-between items-center gap-4 px-6 md:px-12 py-8 border-t border-white/5">
      <p className="text-[9px] font-headline tracking-[0.5em] text-white/40 uppercase">
        &copy; {new Date().getFullYear()} DANIEL PORTFOLIO
      </p>
      <nav aria-label="Social links" className="flex gap-8">
        <a
          href="/arcade"
          aria-label="Open hidden arcade"
          className="relative flex items-center gap-2 text-[9px] font-headline tracking-[0.3em] text-white/40 hover:text-[#ff9f43] transition-colors uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-[#ff9f43] animate-pulse-soft shadow-[0_0_0_rgba(255,159,67,0.6)]" />
          ARCADE
        </a>
      </nav>
    </footer>
  );
}
