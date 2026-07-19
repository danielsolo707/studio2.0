export type SendEmailInput = {
  to: string | string[]
  subject: string
  text: string
  replyTo?: string
}

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string }

/** Sends a plain-text email through Resend without exposing provider errors to visitors. */
export async function sendEmail({ to, subject, text, replyTo }: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!apiKey || !from) return { ok: false, error: 'Email service is not configured.' }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    })
    const payload = await response.json().catch(() => ({})) as { id?: string; message?: string; name?: string }
    if (!response.ok) return { ok: false, error: payload.message || payload.name || `Email provider returned ${response.status}.` }
    return { ok: true, id: payload.id }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Email provider request failed.' }
  }
}
