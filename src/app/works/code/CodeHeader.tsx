"use client"

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function CodeHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-[#30363d]"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-6 flex items-center justify-between">
        <Link
          href="/gateway"
          className="inline-flex items-center gap-2 font-mono text-[12px] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          <ArrowLeft size={14} />
          cd ..
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/works/motion"
            className="font-mono text-[12px] text-[#8b949e] hover:text-white transition-colors"
          >
            motion/
          </Link>
          <Link
            href="/works/code"
            className="font-mono text-[12px] text-[#7ee787] border-b border-[#7ee787] pb-0.5"
          >
            code/
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
