"use client"

import { useActionState, useState, useEffect, useCallback } from 'react';
import { loginAction } from './actions';
import { TwoFactorForm } from './TwoFactorForm';

const initialState: { error?: string; needs2FA?: boolean; captchaError?: boolean } = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [show2FA, setShow2FA] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await fetch('/api/captcha?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        setCaptchaQuestion(data.question);
      }
    } catch {
      setCaptchaQuestion('3 + 7');
    }
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  useEffect(() => {
    if (state.captchaError) {
      refreshCaptcha();
    }
  }, [state.captchaError, refreshCaptcha]);

  if (state.needs2FA || show2FA) {
    return <TwoFactorForm onBack={() => setShow2FA(false)} />;
  }

  return (
    <form action={formAction} className="space-y-4">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline" htmlFor="captcha">
            CAPTCHA
          </label>
          <button
            type="button"
            onClick={() => { setCaptchaKey(k => k + 1); refreshCaptcha(); }}
            className="text-[10px] text-white/40 hover:text-[#DFFF00] transition-colors font-headline"
          >
            ↻ REFRESH
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-white font-body text-sm select-none">
            {captchaQuestion ? `= ${captchaQuestion}` : 'Loading...'}
          </div>
          <input
            key={captchaKey}
            id="captcha"
            name="captcha"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            placeholder="?"
            required
            className="w-20 bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm text-center focus:border-[#DFFF00]/50 focus:outline-none"
          />
        </div>
      </div>

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
