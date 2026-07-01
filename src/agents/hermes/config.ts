import { config } from 'dotenv'
import { hermesManifest } from './manifest'

// Ensure .env.local takes precedence over inherited system/user env vars
// so the configured assistant provider key matches the project file.
config({ path: '.env.local', override: true })

export type HermesConfig = {
  apiKey?: string
  model: string
  publicName: string
}

export function getHermesConfig(): HermesConfig {
  return {
    apiKey: process.env.OPENROUTER_API_KEY || process.env.HERMES_API_KEY,
    model: process.env.OPENROUTER_MODEL || process.env.HERMES_MODEL || hermesManifest.defaultModel,
    publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
  }
}

export function isHermesConfigured(config = getHermesConfig()) {
  return Boolean(config.apiKey && config.model)
}
