"use client"

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function MotionHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <Link
          href="/gateway"
          className="inline-flex items-center gap-2 font-headline text-[10px] tracking-[0.3em] text-white/60 hover:text-[#DFFF00] transition-colors"
        >
          <ArrowLeft size={14} />
          BACK
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/works/motion"
            className="font-headline text-[10px] tracking-[0.3em] text-[#DFFF00] border-b border-[#DFFF00] pb-1"
          >
            MOTION
          </Link>
          <Link
            href="/works/code"
            className="font-headline text-[10px] tracking-[0.3em] text-white/40 hover:text-white transition-colors"
          >
            CODE
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
