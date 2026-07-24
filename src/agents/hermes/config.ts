import { hermesManifest } from './manifest'
import { getAiConfigForMode } from '@/lib/ai/ai-settings'
import type { HermesMode } from './schemas/chat'

export type HermesConfig = {
  apiKey?: string
  model: string
  publicName: string
  provider: 'deepseek'
  baseURL: string
}

/** Sync fallback for contexts where async isn't available (e.g. quick checks). */
export function getHermesConfigSync(): HermesConfig {
  return {
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: hermesManifest.defaultModel,
    publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
    provider: 'deepseek',
    baseURL: 'https://api.deepseek.com',
  }
}

/**
 * Async config reader: env var takes priority (matching Cloudflare pattern),
 * falls back to DB settings, then to sync env fallback.
 */
export async function getHermesConfig(mode: HermesMode = 'public'): Promise<HermesConfig> {
  // DEEPSEEK_API_KEY env var is the explicit deployment config and takes priority
  // over any previously saved dashboard settings.
  if (process.env.DEEPSEEK_API_KEY) {
    return getHermesConfigSync()
  }

  try {
    const aiConfig = await getAiConfigForMode(mode)
    if (aiConfig.apiKey && aiConfig.model) {
      return {
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
        provider: 'deepseek',
        baseURL: 'https://api.deepseek.com',
      }
    }
  } catch {
    // Fall through to sync fallback
  }

  return getHermesConfigSync()
}

export function isHermesConfigured(config: HermesConfig): boolean {
  return Boolean(config.apiKey && config.model)
}