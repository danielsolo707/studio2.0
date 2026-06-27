'use server'

import { sendTelegramMessage, isTelegramConfigured } from '@/lib/integrations/telegram'
import { getSession } from '@/lib/auth/session'

export async function testTelegramNotification(): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  if (!session) {
    return { ok: false, error: 'Unauthorized' }
  }

  if (!isTelegramConfigured()) {
    return { ok: false, error: 'Telegram bot token or chat ID is not configured' }
  }

  return sendTelegramMessage('Test notification from The Fluid Logic dashboard. Hermes remote integration is active.')
}
