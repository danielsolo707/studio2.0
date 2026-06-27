import { callHermes } from '../client'
import type { HermesChatMessage, HermesMode } from '../schemas/chat'
import { parseHermesToolCalls } from '../schemas/tool-call'
import { executeHermesTool } from '../tools/executor'
import type { HermesAction, HermesToolResult } from '../tools/types'
import { buildAdminHermesSystemPrompt, buildPublicHermesSystemPrompt } from './context-builders'

const MAX_HISTORY = 12

function cleanMessages(messages: HermesChatMessage[]) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-MAX_HISTORY)
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').slice(0, 4000),
    }))
}

export type HermesRunResult = {
  configured: boolean
  message: string
  model?: string
  actions?: HermesAction[]
  toolResults?: HermesToolResult[]
  error?: string
}

export async function runHermesChat(mode: HermesMode, messages: HermesChatMessage[]): Promise<HermesRunResult> {
  const system = mode === 'admin'
    ? await buildAdminHermesSystemPrompt()
    : await buildPublicHermesSystemPrompt()

  const payload: HermesChatMessage[] = [
    { role: 'system', content: system },
    ...cleanMessages(messages),
  ]

  const result = await callHermes(payload)

  if (!result.configured) {
    return {
      configured: false,
      message: result.message,
      model: result.model,
    }
  }

  const { text, toolCalls } = parseHermesToolCalls(result.message)

  if (mode !== 'admin' || toolCalls.length === 0) {
    return {
      configured: true,
      message: text || result.message,
      model: result.model,
    }
  }

  const actions: HermesAction[] = []
  const toolResults: HermesToolResult[] = []

  for (const call of toolCalls) {
    try {
      const { result: toolResult, action } = await executeHermesTool(call)
      toolResults.push(toolResult)
      actions.push(action)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      toolResults.push({ type: 'error', message })
    }
  }

  const summary = toolResults
    .map((result) => {
      switch (result.type) {
        case 'draft':
          return `Draft ready: ${result.message}`
        case 'applied':
          return `Done: ${result.message}`
        case 'error':
          return `Error: ${result.message}`
        default:
          return result.message
      }
    })
    .join('\n')

  return {
    configured: true,
    message: text ? `${text}\n\n${summary}`.trim() : summary,
    model: result.model,
    actions,
    toolResults,
  }
}
