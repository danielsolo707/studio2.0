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
      className="relative z-20 min-h-screen flex items-center px-6 md:px-24 py-32 bg-black/40 backdrop-blur-sm"
    >
      <div className="max-w-4xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.7 }}
          viewport={{ once: true }}
          className="font-headline text-[10px] tracking-[0.5em] mb-12 text-[#DFFF00]"
        >
          {label}
        </motion.p>

        <motion.h2
          id="about-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-headline text-4xl md:text-7xl mb-12 leading-[1.1] tracking-tighter text-white"
        >
          {headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.85 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl font-body max-w-2xl mb-16 leading-relaxed text-white/90"
        >
          {body}
        </motion.p>

        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.7 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-x-6 gap-y-3 font-headline text-[10px] tracking-[0.3em]"
          aria-label="Skills and tools"
        >
          {skills.map((skill, i) => (
            <React.Fragment key={skill}>
              {i > 0 && (
                <li aria-hidden="true" className="text-white/30">
                  /
                </li>
              )}
              <li className="hover:text-[#DFFF00] transition-colors cursor-default text-white/60">
                {skill}
              </li>
            </React.Fragment>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
