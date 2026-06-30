export const hermesManifest = {
  internalName: 'Studio Assistant',
  publicName: 'Studio Assistant',
  defaultModel: 'cohere/north-mini-code:free',
  provider: 'openrouter',
  promptFormat: 'chatml',
  supportsTools: true,
  supportsJsonMode: true,
} as const
