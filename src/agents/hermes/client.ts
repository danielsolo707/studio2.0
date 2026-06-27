import { getHermesConfig, isHermesConfigured } from './config'
import type { HermesChatMessage } from './schemas/chat'

type HermesCompletionChoice = {
  message?: {
    role?: string
    content?: string
  }
}

type HermesCompletionResponse = {
  choices?: HermesCompletionChoice[]
  error?: {
    message?: string
  }
}

export async function callHermes(messages: HermesChatMessage[]) {
  const config = getHermesConfig()

  if (!isHermesConfigured(config)) {
    return {
      configured: false,
      message: 'Hermes is not configured yet. Add HERMES_API_BASE_URL, HERMES_MODEL, and optionally HERMES_API_KEY.',
      model: config.model,
    }
  }

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }

  if (config.apiKey) {
    headers.authorization = `Bearer ${config.apiKey}`
  }

  const response = await fetch(`${config.apiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.4,
      max_tokens: 900,
    }),
    cache: 'no-store',
  })

  const data = (await response.json().catch(() => ({}))) as HermesCompletionResponse

  if (!response.ok) {
    throw new Error(data.error?.message || `Hermes request failed with status ${response.status}`)
  }

  return {
    configured: true,
    message: data.choices?.[0]?.message?.content || 'Hermes returned an empty response.',
    model: config.model,
  }
}

