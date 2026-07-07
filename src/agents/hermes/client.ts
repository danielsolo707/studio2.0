import type { HermesChatMessage } from './schemas/chat'

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

// ─── Rate limiter: 40 requests per minute (token bucket) ─────────────────
const RATE_LIMIT_RPM = 40
const RATE_INTERVAL_MS = 60_000 / RATE_LIMIT_RPM // 1500ms between requests

let lastRequestTime = 0
let queuedPromise: Promise<void> | null = null

async function waitForRateLimit(): Promise<void> {
  const now = Date.now()
  const waitMs = Math.max(0, RATE_INTERVAL_MS - (now - lastRequestTime))

  if (waitMs > 0) {
    // Chain onto the previous wait to keep spacing even under concurrency
    const prev = queuedPromise
    queuedPromise = new Promise<void>((resolve) => {
      ;(prev || Promise.resolve()).then(() => {
        const elapsed = Date.now() - lastRequestTime
        const remaining = Math.max(0, RATE_INTERVAL_MS - elapsed)
        setTimeout(() => resolve(), remaining)
      })
    })
    await queuedPromise
  }

  lastRequestTime = Date.now()
}

export type HermesCallOptions = {
  temperature?: number
  maxTokens?: number
  /** Timeout in ms (default 15000 for public, 30000 for admin) */
  timeoutMs?: number
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

export async function callHermes(
  messages: HermesChatMessage[],
  options: HermesCallOptions & { apiKey: string; model: string },
): Promise<{
  configured: boolean
  message: string
  model: string
}> {
  const { apiKey, model, timeoutMs = 30000, ...callOpts } = options

  if (!apiKey || !model) {
    return {
      configured: false,
      message: 'Assistant is not configured yet. Set API key and model in the dashboard or .env.local.',
      model: model || 'unknown',
    }
  }

  // Wait for rate-limit slot (40 req/min)
  await waitForRateLimit()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  // Convert our messages to OpenAI-compatible format (NVIDIA NIM uses this)
  const openaiMessages = messages.map((msg) => {
    if (msg.role === 'system') {
      return { role: 'system', content: String(msg.content || '') }
    }
    if (msg.role === 'assistant') {
      return { role: 'assistant', content: String(msg.content || '') }
    }
    return { role: 'user', content: String(msg.content || '') }
  })

  try {
    const response = await fetch(NVIDIA_BASE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: callOpts.temperature ?? 0.3,
        max_tokens: callOpts.maxTokens ?? 600,
        top_p: 0.95,
        stream: false,
        chat_template_kwargs: { enable_thinking: false },
      }),
      cache: 'no-store',
      signal: controller.signal,
    })

    clearTimeout(timer)

    const data = (await response.json().catch(() => ({}))) as CompletionResponse

    if (!response.ok) {
      throw new Error(data.error?.message || `Request failed with status ${response.status}`)
    }

    let content = data.choices?.[0]?.message?.content || 'Assistant returned an empty response.'

    // Strip reasoning/thinking blocks from any model that outputs them
    content = content.replace(/<think[\s\S]*?<\/think>/g, '')
    content = content.replace(/<\/?think[^>]*>/g, '')
    content = content.trim()

    return {
      configured: true,
      message: content,
      model,
    }
  } catch (error) {
    clearTimeout(timer)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The AI model took too long to respond.')
    }
    throw error
  }
}
