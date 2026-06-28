import { getHermesConfig, isHermesConfigured } from './config'
import type { HermesChatMessage } from './schemas/chat'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export type HermesCallOptions = {
  temperature?: number
  maxTokens?: number
}

type CompletionChoice = {
  message?: {
    role?: string
    content?: string
  }
}

type CompletionResponse = {
  choices?: CompletionChoice[]
  error?: {
    message?: string
  }
}

export async function callHermes(messages: HermesChatMessage[], options: HermesCallOptions = {}) {
  const config = getHermesConfig()

  if (!isHermesConfigured(config)) {
    return {
      configured: false,
      message: 'Assistant is not configured yet. Set OPENROUTER_API_KEY and OPENROUTER_MODEL in .env.local.',
      model: config.model,
    }
  }

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }

  if (config.apiKey) {
    headers.authorization = `Bearer ${config.apiKey}`
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 600,
    }),
    cache: 'no-store',
  })

  const data = (await response.json().catch(() => ({}))) as CompletionResponse

  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`)
  }

  return {
    configured: true,
    message: data.choices?.[0]?.message?.content || 'Assistant returned an empty response.',
    model: config.model,
  }
}
