"use client"

import { useActionState, useEffect, useRef } from 'react';
import { changePasswordAction } from './actions';

const initialState: { error?: string; success?: boolean } = {};

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="current-password"
          className="text-[10px] tracking-[0.3em] text-white/60 font-headline"
        >
          CURRENT PASSWORD
        </label>
        <input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="block box-border w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm focus:border-[#DFFF00]/50 focus:outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="new-password"
          className="text-[10px] tracking-[0.3em] text-white/60 font-headline"
        >
          NEW PASSWORD
        </label>
        <input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="block box-border w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm focus:border-[#DFFF00]/50 focus:outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm-password"
          className="text-[10px] tracking-[0.3em] text-white/60 font-headline"
        >
          CONFIRM PASSWORD
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="block box-border w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm focus:border-[#DFFF00]/50 focus:outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] disabled:opacity-60 hover:bg-[#d4ff00] transition-colors"
      >
        {isPending ? 'UPDATING...' : 'UPDATE PASSWORD'}
      </button>

      {state.error && (
        <p className="text-xs text-red-400 font-body" role="status">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-xs text-[#DFFF00] font-body" role="status">
          Password updated. Use the new password next time you sign in.
        </p>
      )}
    </form>
  );
}
