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
  provider: 'cloudflare-workers-ai' | 'nvidia-nim'
  baseURL: string
}

/** Sync fallback for contexts where async isn't available (e.g. quick checks). */
export function getHermesConfigSync(): HermesConfig {
  const cloudflareApiKey = process.env.CLOUDFLARE_AI_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
  if (cloudflareApiKey && cloudflareAccountId) {
    return {
      apiKey: cloudflareApiKey,
      model: process.env.CLOUDFLARE_AI_MODEL || '@cf/google/gemma-4-26b-a4b-it',
      publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
      provider: 'cloudflare-workers-ai',
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/v1`,
    }
  }
  return {
    apiKey: process.env.NVIDIA_NIM_API_KEY || process.env.HERMES_API_KEY,
    model: process.env.NVIDIA_NIM_MODEL || process.env.HERMES_MODEL || hermesManifest.defaultModel,
    publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
    provider: 'nvidia-nim',
    baseURL: 'https://integrate.api.nvidia.com/v1',
  }
}

/**
 * Async config reader: tries DB first (dual model support), falls back to env vars.
 * Used in the actual chat flow.
 */
export async function getHermesConfig(mode: HermesMode = 'public'): Promise<HermesConfig> {
  // Workers AI is an explicit deployment configuration and must take priority
  // over any previously saved NVIDIA-compatible dashboard setting.
  const envConfig = getHermesConfigSync()
  if (envConfig.provider === 'cloudflare-workers-ai') {
    return {
      ...envConfig,
      model: mode === 'admin'
        ? process.env.CLOUDFLARE_AI_ADMIN_MODEL || envConfig.model
        : process.env.CLOUDFLARE_AI_PUBLIC_MODEL || envConfig.model,
    }
  }

  try {
    const aiConfig = await getAiConfigForMode(mode)
    if (aiConfig.apiKey && aiConfig.model) {
      return {
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
        provider: 'nvidia-nim',
        baseURL: 'https://integrate.api.nvidia.com/v1',
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
