"use client"

import React from 'react';
import { motion } from 'framer-motion';

/**
 * About section — animated text + skill list.
 * Uses `whileInView` for scroll-triggered reveals.
 */
export function AboutSection({
  label,
  headline,
  body,
  skills,
}: {
  label: string;
  headline: string;
  body: string;
  skills: string[];
}) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative z-20 py-20 md:py-28 px-6 md:px-16 bg-[#050507] scroll-mt-24 md:scroll-mt-32"
    >
      <div className="absolute inset-0 about-scrim pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto grid gap-12 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] items-start">
        <div className="space-y-10">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            viewport={{ once: true }}
            className="font-headline text-[12px] tracking-[0.5em] text-[#DFFF00]"
          >
            {label}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            whileInView={{ opacity: 1, height: 120 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-[1px] bg-gradient-to-b from-[#DFFF00]/60 via-white/20 to-transparent"
            aria-hidden="true"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.7, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-body text-sm md:text-base text-white/60 max-w-xs leading-relaxed"
          >
            Motion design, real-time systems, and experiments that translate intent into cinematic interaction.
          </motion.p>
        </div>

        <div>
          <motion.h2
            id="about-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-headline text-[clamp(2rem,4.6vw,4rem)] mb-8 leading-[1.1] tracking-[-0.02em] text-white"
          >
            {headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.85 }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-base md:text-lg font-body max-w-2xl mb-12 leading-relaxed text-white/80"
          >
            {body}
          </motion.p>

          <motion.ul
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.75 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap gap-x-4 gap-y-3 font-headline text-[10px] tracking-[0.3em]"
            aria-label="Skills and tools"
          >
            {skills.map((skill, i) => (
              <React.Fragment key={skill}>
                {i > 0 && (
                  <li aria-hidden="true" className="text-white/25">
                    /
                  </li>
                )}
                <li className="hover:text-[#DFFF00] transition-colors cursor-default text-white/60">
                  {skill}
                </li>
              </React.Fragment>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="mt-10"
          >
            <a
              href="https://github.com/danielsolo707"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-6 py-2 border border-white/20 font-headline text-[10px] tracking-[0.2em] text-white/60 hover:border-[#DFFF00]/50 hover:text-[#DFFF00] transition-colors"
            >
              GITHUB
              <span className="h-[1px] w-6 bg-white/20" aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
