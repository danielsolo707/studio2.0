"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactForm } from '@/components/ContactForm';
import { Footer } from '@/components/Footer';

/** Contact CTA + form section */
export function ContactSection() {
  const [mode, setMode] = useState<'form' | 'success'>('form');
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSuccess = () => {
    setMode('success');
    setShowForm(true);
    setFormKey((prev) => prev + 1);
  };

  const handleSendAnother = () => {
    setMode('form');
    setShowForm(true);
    setFormKey((prev) => prev + 1);
  };

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
    setMode('form');
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative z-20 min-h-[100svh] flex flex-col px-6 py-16 md:px-12 lg:px-20 md:py-20 scroll-mt-24"
    >
      <div className="absolute inset-0 contact-scrim pointer-events-none" aria-hidden="true" />

      <div className="relative flex-1 w-full max-w-[1360px] mx-auto grid gap-10 md:gap-10 xl:gap-14 md:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] items-center">
        <div
          className="pointer-events-none absolute left-0 top-[18%] hidden h-px w-28 bg-gradient-to-r from-[#DFFF00]/35 to-transparent xl:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 bottom-[18%] hidden h-px w-36 bg-gradient-to-l from-white/16 to-transparent xl:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-0 bottom-20 hidden h-28 w-px bg-gradient-to-b from-[#DFFF00]/35 to-transparent xl:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-20 hidden h-32 w-px bg-gradient-to-b from-white/14 to-transparent xl:block"
          aria-hidden="true"
        />
        <div
          className={`min-w-0 flex flex-col items-center text-center space-y-6 justify-self-center md:max-w-[620px] ${
            showForm ? '' : 'md:col-span-2'
          }`}
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            className="font-headline text-[12px] tracking-[0.5em] uppercase text-[#DFFF00]"
          >
            GET IN TOUCH
          </motion.p>

          <motion.button
            id="contact-heading"
            type="button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={handleToggleForm}
            className="font-headline whitespace-nowrap text-[clamp(2.2rem,4.2vw,4.6rem)] leading-none tracking-[-0.02em] italic text-white hover:text-[#DFFF00] transition-colors"
            aria-expanded={showForm}
            aria-controls="contact-form"
          >
            LET&apos;S TALK
          </motion.button>

          {showForm && (
            <>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 0.75, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-body text-sm md:text-base text-white/70 max-w-lg leading-relaxed"
              >
                Tell me about the project, the emotion, and the system you want to bring to life.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 0.7, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-headline tracking-[0.35em] text-white/40"
              >
                <span>MOTION</span>
                <span className="h-[1px] w-6 bg-white/15" aria-hidden="true" />
                <span>CODE</span>
                <span className="h-[1px] w-6 bg-white/15" aria-hidden="true" />
                <span>EXPERIMENTS</span>
              </motion.div>
            </>
          )}
        </div>

        <div className={showForm ? 'relative min-w-0 w-full max-w-[780px] justify-self-end' : 'hidden'}>
          <AnimatePresence mode="wait">
            {showForm && mode === 'form' ? (
              <motion.div
                key="contact-form"
                id="contact-form"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative min-w-0"
              >
                <div className="absolute -inset-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.55)]" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl p-5 md:p-6 lg:p-8 xl:p-9">
                  <ContactForm key={formKey} onSuccess={handleSuccess} />
                </div>
              </motion.div>
            ) : showForm && mode === 'success' ? (
              <motion.div
                key="contact-success"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
                role="status"
                aria-live="polite"
              >
                <p className="font-headline text-[12px] tracking-[0.4em] text-[#DFFF00] mb-4">
                  MESSAGE SENT
                </p>
                <h3 className="font-headline text-2xl md:text-3xl text-white mb-3">
                  Message successfully sent.
                </h3>
                <p className="font-body text-white/70 leading-relaxed mb-8">
                  I&apos;ll get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={handleSendAnother}
                  className="inline-flex items-center gap-3 px-6 py-3 border border-[#DFFF00]/40 text-[#DFFF00] font-headline text-[10px] tracking-[0.3em] hover:bg-[#DFFF00]/10 transition-colors"
                >
                  SEND ANOTHER MESSAGE
                  <span className="h-[1px] w-6 bg-[#DFFF00]/40" aria-hidden="true" />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </section>
  );
}
