"use client"

import { useCallback, useState } from 'react';

export function CaptchaToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const enable = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/captcha', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enable');
      setEnabled(true);
      setMessage('CAPTCHA enabled.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enable CAPTCHA');
    } finally {
      setLoading(false);
    }
  }, []);

  const disable = useCallback(async () => {
    if (!confirm('Are you sure you want to disable CAPTCHA?')) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/captcha', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disable');
      setEnabled(false);
      setMessage('CAPTCHA disabled.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disable CAPTCHA');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="border border-white/10 p-6 bg-black/30 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00]">
          CAPTCHA
        </h2>
        <span
          className={`text-[10px] font-headline tracking-widest px-3 py-1 rounded-full border ${
            enabled
              ? 'border-green-500/50 text-green-400'
              : 'border-white/20 text-white/40'
          }`}
        >
          {enabled ? 'ENABLED' : 'DISABLED'}
        </span>
      </div>

      <p className="text-xs text-white/50 font-body mb-4">
        Toggle Cloudflare Turnstile on the admin login page.
      </p>

      <div className="flex items-center gap-3">
        {enabled ? (
          <button
            onClick={disable}
            disabled={loading}
            className="px-4 py-2 border border-red-500/50 text-red-300 text-xs tracking-widest disabled:opacity-50"
          >
            {loading ? 'DISABLING...' : 'DISABLE CAPTCHA'}
          </button>
        ) : (
          <button
            onClick={enable}
            disabled={loading}
            className="px-4 py-2 bg-[#DFFF00] text-black text-xs tracking-widest font-headline disabled:opacity-50"
          >
            {loading ? 'ENABLING...' : 'ENABLE CAPTCHA'}
          </button>
        )}
      </div>

      {message && (
        <p className="text-xs text-green-400 font-body mt-3" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 font-body mt-3" role="status">
          {error}
        </p>
      )}
    </section>
  );
}
