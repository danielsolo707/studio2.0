"use client"

import { useActionState, useState } from 'react';
import Script from 'next/script';
import { loginAction } from '@/app/dashboard/actions';
import { TwoFactorForm } from './TwoFactorForm';

const initialState: { error?: string; needs2FA?: boolean } = {};

export function LoginForm({ captchaEnabled }: { captchaEnabled: boolean }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [show2FA, setShow2FA] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (state.needs2FA || show2FA) {
    return <TwoFactorForm onBack={() => setShow2FA(false)} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      {captchaEnabled && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}
      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline" htmlFor="admin-user">
          USERNAME
        </label>
        <input
          id="admin-user"
          name="username"
          autoComplete="username"
          placeholder="admin"
          className="w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm focus:border-[#DFFF00]/50 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline" htmlFor="admin-pass">
          PASSWORD
        </label>
        <input
          id="admin-pass"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm focus:border-[#DFFF00]/50 focus:outline-none"
        />
      </div>

      {captchaEnabled && (
        <div className="space-y-2">
          <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">
            CAPTCHA
          </label>
          {siteKey ? (
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-theme="dark"
            />
          ) : (
            <p className="text-xs text-red-400 font-body" role="status">
              Turnstile site key is not configured.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] disabled:opacity-60"
      >
        {isPending ? 'SIGNING IN...' : 'SIGN IN'}
      </button>

      {state.error && (
        <p className="text-xs text-red-400 font-body" role="status">
          {state.error}
        </p>
      )}
    </form>
  );
}
