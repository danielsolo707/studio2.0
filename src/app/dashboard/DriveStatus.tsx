"use client"

import { useState, useEffect } from 'react';
import { HardDrive, Check, X } from 'lucide-react';

type DriveStatus = 'checking' | 'connected' | 'disconnected' | 'error';

export function DriveStatusSection() {
  const [status, setStatus] = useState<DriveStatus>('checking');
  const [message, setMessage] = useState('');
  const [driveConfigured, setDriveConfigured] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gdriveConnected = params.get('gdrive_connected');
    const gdriveError = params.get('gdrive_error');

    if (gdriveConnected === 'true') {
      setStatus('connected');
      setMessage('Successfully connected to Google Drive!');
      const timer = setTimeout(() => {
        window.location.replace('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    } else if (gdriveError) {
      setStatus('error');
      setMessage(`Connection failed: ${gdriveError}`);
      const timer = setTimeout(() => {
        window.location.replace('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }

    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/drive/status');
      if (res.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch {
      setStatus('disconnected');
    }
  };

  const disconnect = async () => {
    try {
      await fetch('/api/drive/disconnect', { method: 'POST' });
      setStatus('disconnected');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center py-4">
        <span className="text-xs text-white/40 tracking-widest">CHECKING...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#DFFF00]">
          <Check size={14} />
          <span className="text-xs font-headline tracking-[0.3em]">{message || 'CONNECTED'}</span>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 border border-white/20 text-xs font-headline tracking-[0.3em] text-white/60 hover:border-red-400 hover:text-red-400"
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <X size={14} />
          <span className="text-xs font-headline tracking-[0.3em]">{message}</span>
        </div>
        <button
          onClick={checkConnection}
          className="px-4 py-2 border border-white/20 text-xs font-headline tracking-[0.3em]"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white/40">
        <HardDrive size={14} />
        <span className="text-xs font-headline tracking-[0.3em]">NOT CONNECTED</span>
      </div>
      <a
        href="/api/auth/google-drive/connect"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#DFFF00] text-black text-xs font-headline tracking-[0.3em] hover:bg-[#d4ff00]"
      >
        CONNECT NOW
      </a>
    </div>
  );
}
