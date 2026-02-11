"use client"

import { useActionState } from 'react';
import { verify2FAAction } from './actions';

const initialState: { error?: string } = {};

export function TwoFactorForm({ onBack }: { onBack: () => void }) {
  const [state, formAction, isPending] = useActionState(verify2FAAction, initialState);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full border border-[#DFFF00]/30 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DFFF00" strokeWidth="1.5">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <p className="text-[10px] tracking-[0.4em] text-[#DFFF00] font-headline">
          TWO-FACTOR AUTHENTICATION
        </p>
        <p className="text-xs text-white/40 font-body">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-[10px] tracking-[0.3em] text-white/60 font-headline"
            htmlFor="totp-code"
          >
            VERIFICATION CODE
          </label>
          <input
            id="totp-code"
            name="totp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            placeholder="000000"
            className="w-full bg-transparent border border-white/10 px-4 py-3 text-white font-headline text-2xl tracking-[0.5em] text-center focus:border-[#DFFF00]/50 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] disabled:opacity-60"
        >
          {isPending ? 'VERIFYING...' : 'VERIFY'}
        </button>

        {state.error && (
          <p className="text-xs text-red-400 font-body text-center" role="status">
            {state.error}
          </p>
        )}
      </form>

      <button
        onClick={onBack}
        className="w-full text-center text-[10px] tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors font-headline"
      >
        ← BACK TO LOGIN
      </button>
    </div>
  );
}
