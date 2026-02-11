"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContactForm } from '@/components/ContactForm';
import { Footer } from '@/components/Footer';

/** Contact CTA + form section */
export function ContactSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative z-20 min-h-screen flex flex-col items-center justify-between px-6 md:px-24 py-24"
    >
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <div className="text-center space-y-4 mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            className="font-headline text-[10px] tracking-[0.5em] uppercase text-[#DFFF00]"
          >
            GET IN TOUCH
          </motion.p>

          <motion.button
            id="contact-heading"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={() => setShowForm((prev) => !prev)}
            className="font-headline text-5xl md:text-[8vw] tracking-tighter italic text-white hover:text-[#DFFF00] transition-colors"
            aria-expanded={showForm}
            aria-controls="contact-form"
          >
            LET&apos;S TALK
          </motion.button>
        </div>

        {showForm && (
          <motion.div
            id="contact-form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full flex justify-center"
          >
            <ContactForm />
          </motion.div>
        )}
      </div>

      <Footer />
    </section>
  );
}
