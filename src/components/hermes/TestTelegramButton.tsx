"use client"

import { useState } from 'react'
import { testTelegramNotification } from '@/app/dashboard/hermes/test-telegram'

export function TestTelegramButton() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setStatus('pending')
    setError(null)
    const result = await testTelegramNotification()
    if (result.ok) {
      setStatus('ok')
    } else {
      setStatus('error')
      setError(result.error || 'Failed')
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'pending'}
        className="w-full rounded border border-[#DFFF00]/40 px-3 py-2 text-xs font-medium uppercase tracking-wider text-[#DFFF00] transition-colors hover:bg-[#DFFF00]/10 disabled:opacity-50"
      >
        {status === 'pending' ? 'Sending...' : 'Test Telegram'}
      </button>
      {status === 'ok' && (
        <p className="text-[11px] text-[#DFFF00]">Message sent.</p>
      )}
      {status === 'error' && error && (
        <p className="text-[11px] text-red-300">{error}</p>
      )}
    </div>
  )
}
