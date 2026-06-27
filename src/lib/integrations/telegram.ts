export type TelegramConfig = {
  botToken: string
  chatId: string
}

export function getTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return null
  return { botToken, chatId }
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

export async function sendTelegramMessage(text: string): Promise<{ ok: boolean; error?: string }> {
  const config = getTelegramConfig()
  if (!config) {
    return { ok: false, error: 'Telegram not configured' }
  }

  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { ok: false, error: data.description || `HTTP ${response.status}` }
    }

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: message }
  }
}

export async function notifyNewContactMessage(name: string, email: string, message: string) {
  const text = `<b>New contact message</b>\n\n<b>From:</b> ${escapeHtml(name)}\n<b>Email:</b> ${escapeHtml(email)}\n\n${escapeHtml(message.slice(0, 800))}`
  return sendTelegramMessage(text)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
