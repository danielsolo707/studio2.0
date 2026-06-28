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

async function callVpsHermes(messages: HermesChatMessage[]): Promise<{
  configured: boolean
  message: string
  model?: string
}> {
  const config = getHermesConfig()

  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
  const text = lastUserMessage?.content || ''

  const response = await fetch(`${config.vpsChatUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.vpsApiKey}`,
    },
    body: JSON.stringify({ message: text }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`VPS Hermes returned ${response.status}: ${body}`)
  }

  const data = await response.json()

  return {
    configured: true,
    message: data.reply || 'VPS Hermes returned an empty response.',
    model: 'hermes-agent-vps',
  }
}

async function callOpenAiCompatible(messages: HermesChatMessage[]): Promise<{
  configured: boolean
  message: string
  model?: string
}> {
  const config = getHermesConfig()

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

export async function callHermes(messages: HermesChatMessage[]) {
  const config = getHermesConfig()

  if (!isHermesConfigured(config)) {
    return {
      configured: false,
      message: 'Hermes is not configured yet. Add HERMES_VPS_CHAT_URL or HERMES_API_BASE_URL + HERMES_MODEL.',
      model: config.model,
    }
  }

  if (config.vpsChatUrl) {
    return callVpsHermes(messages)
  }

  return callOpenAiCompatible(messages)
}
