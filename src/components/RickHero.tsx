"use client"

import Image from 'next/image';
import { motion } from 'framer-motion';

export function RickHero() {
  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      animate={{ y: [0, -12, 0] }}
      transition={{
        y: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0 hero-cube-halo"
        aria-hidden="true"
      />

      <Image
        src="/images/rick-pickle.png"
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 720px"
        className="object-contain scale-110 md:scale-125 drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))' }}
      />
    </motion.div>
  );
}
