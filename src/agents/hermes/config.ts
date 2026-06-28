import { hermesManifest } from './manifest'

export type HermesConfig = {
  apiBaseUrl: string
  apiKey?: string
  model: string
  publicName: string
  vpsChatUrl: string
  vpsApiKey: string
}

export function getHermesConfig(): HermesConfig {
  return {
    apiBaseUrl: process.env.HERMES_API_BASE_URL?.replace(/\/$/, '') || '',
    apiKey: process.env.HERMES_API_KEY,
    model: process.env.HERMES_MODEL || hermesManifest.defaultModel,
    publicName: process.env.NEXT_PUBLIC_HERMES_PUBLIC_NAME || hermesManifest.publicName,
    vpsChatUrl: process.env.HERMES_VPS_CHAT_URL?.replace(/\/$/, '') || '',
    vpsApiKey: process.env.HERMES_VPS_API_KEY || '',
  }
}

export function isHermesConfigured(config = getHermesConfig()) {
  return Boolean(config.vpsChatUrl || (config.apiBaseUrl && config.model))
}

