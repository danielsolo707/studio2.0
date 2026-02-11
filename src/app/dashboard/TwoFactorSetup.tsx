"use client"

import { useState, useCallback } from 'react';

type SetupData = {
  enabled: boolean;
  qrCodeDataUrl?: string;
  secret?: string;
};

/**
 * 2FA setup/manage panel for the admin dashboard.
 * - Shows current status (enabled/disabled)
 * - Generates QR code for Microsoft Authenticator
 * - Verifies first token to enable 2FA
 * - Allows disabling 2FA
 */
export function TwoFactorSetup({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/2fa');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start setup');
      setSetupData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyAndEnable = useCallback(async () => {
    if (token.length !== 6) {
      setError('Enter a 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setEnabled(true);
      setSetupData(null);
      setToken('');
      setMessage('2FA enabled successfully!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const disable2FA = useCallback(async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/2fa', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disable');
      setEnabled(false);
      setSetupData(null);
      setMessage('2FA disabled.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="border border-white/10 p-6 bg-black/30 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00]">
          TWO-FACTOR AUTH
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

      {/* Enabled state */}
      {enabled && !setupData && (
        <div className="space-y-4">
          <p className="text-xs text-white/50 font-body">
            Your admin panel is protected with two-factor authentication via authenticator app.
          </p>
          <button
            onClick={disable2FA}
            disabled={loading}
            className="px-4 py-2 border border-red-500/50 text-red-300 text-xs tracking-widest disabled:opacity-50"
          >
            {loading ? 'DISABLING...' : 'DISABLE 2FA'}
          </button>
        </div>
      )}

      {/* Disabled state — offer setup */}
      {!enabled && !setupData && (
        <div className="space-y-4">
          <p className="text-xs text-white/50 font-body">
            Add an extra layer of security by scanning a QR code with Microsoft Authenticator, Google Authenticator, or any TOTP-compatible app.
          </p>
          <button
            onClick={startSetup}
            disabled={loading}
            className="px-4 py-2 bg-[#DFFF00] text-black text-xs tracking-widest font-headline disabled:opacity-50"
          >
            {loading ? 'GENERATING...' : 'SETUP 2FA'}
          </button>
        </div>
      )}

      {/* Setup flow — QR code + verify */}
      {setupData && !enabled && (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs text-white/60 font-body">
              1. Open your authenticator app (Microsoft Authenticator, Google Authenticator, etc.)
            </p>
            <p className="text-xs text-white/60 font-body">
              2. Scan the QR code below:
            </p>
          </div>

          {setupData.qrCodeDataUrl && (
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="2FA QR Code — scan with authenticator app"
                  width={200}
                  height={200}
                />
              </div>
            </div>
          )}

          {setupData.secret && (
            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.3em] text-white/40 font-headline">
                OR ENTER MANUALLY:
              </p>
              <code className="block bg-black/60 border border-white/10 px-4 py-2 text-sm text-[#DFFF00] font-mono break-all select-all">
                {setupData.secret}
              </code>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-white/60 font-body">
              3. Enter the 6-digit code from your app to confirm:
            </p>
            <div className="flex gap-3 flex-col sm:flex-row items-stretch">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="flex-1 bg-transparent border border-white/10 px-4 py-3 text-white font-headline text-lg tracking-[0.4em] text-center focus:border-[#DFFF00]/50 focus:outline-none"
              />
              <button
                onClick={verifyAndEnable}
                disabled={loading || token.length !== 6}
                className="sm:w-auto w-full px-6 py-3 bg-[#DFFF00] text-black text-xs tracking-widest font-headline disabled:opacity-50"
              >
                {loading ? 'VERIFYING...' : 'CONFIRM'}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setSetupData(null);
              setToken('');
              setError('');
            }}
            className="text-[10px] tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors font-headline"
          >
            CANCEL SETUP
          </button>
        </div>
      )}

      {/* Status messages */}
      {message && (
        <p className="mt-4 text-xs text-[#DFFF00] font-body">{message}</p>
      )}
      {error && (
        <p className="mt-4 text-xs text-red-400 font-body">{error}</p>
      )}
    </section>
  );
}
