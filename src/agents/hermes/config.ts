import { config } from 'dotenv'
import { hermesManifest } from './manifest'
import { getAiConfigForMode } from '@/lib/ai/ai-settings'
import type { HermesMode } from './schemas/chat'

// Ensure .env.local takes precedence over inherited system/user env vars
// so the configured assistant provider key matches the project file.
config({ path: '.env.local', override: true })

export type HermesConfig = {
  apiKey?: string
  model: string
  publicName: string
}

/** Sync fallback for contexts where async isn't available (e.g. quick checks). */
export function getHermesConfigSync(): HermesConfig {
  return {
    apiKey: process.env.NVIDIA_NIM_API_KEY || process.env.HERMES_API_KEY,
    model: process.env.NVIDIA_NIM_MODEL || process.env.HERMES_MODEL || hermesManifest.defaultModel,
    publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
  }
}

/**
 * Async config reader: tries DB first (dual model support), falls back to env vars.
 * Used in the actual chat flow.
 */
export async function getHermesConfig(mode: HermesMode = 'public'): Promise<HermesConfig> {
  try {
    const aiConfig = await getAiConfigForMode(mode)
    if (aiConfig.apiKey && aiConfig.model) {
      return {
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
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
