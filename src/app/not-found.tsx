import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center px-6">
      <div className="text-center space-y-6">
        <h1 className="font-headline text-[20vw] md:text-[15vw] leading-none text-white/10 tracking-tighter">
          404
        </h1>
        <p className="font-headline text-lg tracking-[0.3em] text-[#DFFF00]">
          PAGE NOT FOUND
        </p>
        <p className="font-body text-sm text-white/40 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#DFFF00]/80 transition-colors mt-8"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
