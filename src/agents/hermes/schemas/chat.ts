export type HermesChatRole = 'system' | 'user' | 'assistant' | 'tool'

export type HermesChatMessage = {
  role: HermesChatRole
  content: string
}

export type HermesMode = 'public' | 'admin'

export type HermesChatRequest = {
  mode: HermesMode
  messages: HermesChatMessage[]
}

export type HermesChatResponse = {
  configured: boolean
  message: HermesChatMessage
  model?: string
  error?: string
}

