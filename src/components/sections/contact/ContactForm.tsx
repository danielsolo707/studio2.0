"use client"

import React, { useActionState, useEffect, useRef } from 'react';
import { submitContact, type ContactState } from '@/app/actions/contact';

const initialState: ContactState = { success: false, message: '', errors: {} };

/**
 * Contact form with zod validation via a Server Action.
 * Works without JS (progressive enhancement) and shows
 * inline validation feedback.
 */
export function ContactForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);
  const successRef = useRef(false);

  useEffect(() => {
    if (state.success && !successRef.current) {
      successRef.current = true;
      onSuccess?.();
    }
    if (!state.success) {
      successRef.current = false;
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="w-full space-y-4 md:space-y-5" noValidate>
      <div className="group">
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
          className="block box-border w-full bg-black/30 border border-white/15 px-4 py-3 text-white font-body text-sm placeholder:text-white/25 focus:border-[#DFFF00]/60 focus:outline-none focus:ring-1 focus:ring-[#DFFF00]/25 transition-all"
        />
        {state.errors?.name && (
          <p className="text-xs text-red-400 mt-1">{state.errors.name}</p>
        )}
      </div>

      <div className="group">
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
          className="block box-border w-full bg-black/30 border border-white/15 px-4 py-3 text-white font-body text-sm placeholder:text-white/25 focus:border-[#DFFF00]/60 focus:outline-none focus:ring-1 focus:ring-[#DFFF00]/25 transition-all"
        />
        {state.errors?.email && (
          <p className="text-xs text-red-400 mt-1">{state.errors.email}</p>
        )}
      </div>

      <div className="group">
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
          rows={3}
          placeholder="Tell me about your project..."
          className="block box-border w-full bg-black/30 border border-white/15 px-4 py-3 text-white font-body text-sm placeholder:text-white/25 focus:border-[#DFFF00]/60 focus:outline-none focus:ring-1 focus:ring-[#DFFF00]/25 transition-all resize-none"
        />
        {state.errors?.message && (
          <p className="text-xs text-red-400 mt-1">{state.errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="block box-border w-full px-8 py-3.5 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#DFFF00]/85 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_10px_30px_rgba(223,255,0,0.12)]"
      >
        {isPending ? 'SENDING...' : 'SEND MESSAGE'}
      </button>

      {state.message && !state.success && (
        <p
          role="status"
          className="font-body text-sm text-center text-red-400"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
