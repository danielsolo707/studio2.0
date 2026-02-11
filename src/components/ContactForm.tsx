"use client"

import React, { useActionState } from 'react';
import { submitContact, type ContactState } from '@/app/actions/contact';

const initialState: ContactState = { success: false, message: '' };

/**
 * Contact form with zod validation via a Server Action.
 * Works without JS (progressive enhancement) and shows
 * inline validation feedback.
 */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  return (
    <form action={formAction} className="space-y-6 max-w-lg w-full" noValidate>
      <div>
        <label
          htmlFor="contact-name"
          className="block font-headline text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2"
        >
          NAME
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          className="w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm placeholder:text-white/20 focus:border-[#DFFF00]/50 focus:outline-none focus:ring-1 focus:ring-[#DFFF00]/30 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block font-headline text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2"
        >
          EMAIL
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          className="w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm placeholder:text-white/20 focus:border-[#DFFF00]/50 focus:outline-none focus:ring-1 focus:ring-[#DFFF00]/30 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block font-headline text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2"
        >
          MESSAGE
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          placeholder="Tell me about your project..."
          className="w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm placeholder:text-white/20 focus:border-[#DFFF00]/50 focus:outline-none focus:ring-1 focus:ring-[#DFFF00]/30 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-8 py-4 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#DFFF00]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isPending ? 'SENDING...' : 'SEND MESSAGE'}
      </button>

      {state.message && (
        <p
          role="status"
          className={`font-body text-sm text-center ${state.success ? 'text-[#DFFF00]' : 'text-red-400'}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
