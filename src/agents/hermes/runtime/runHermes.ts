import { generateText, stepCountIs, tool } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import { getHermesConfig } from '../config'
import { sanitizePublicHermesResponse } from '../sanitize'
import type { HermesChatMessage, HermesMode } from '../schemas/chat'
import { executeHermesTool } from '../tools/executor'
import type { HermesAction, HermesToolResult } from '../tools/types'
import { buildAdminHermesSystemPrompt, buildPublicHermesSystemPrompt } from './context-builders'

const MAX_HISTORY = 6

function cleanMessages(messages: HermesChatMessage[]) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-MAX_HISTORY)
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').slice(0, 4000),
    })) as Array<{ role: 'user' | 'assistant'; content: string }>
}

function stripKimiThinking(text: string) {
  // Some Kimi responses include a reasoning preamble even when thinking is
  // disabled. It is not useful to the dashboard user and can precede the
  // actual answer without an opening <think> tag.
  const closingTag = text.lastIndexOf('</think>')
  return closingTag === -1 ? text.trim() : text.slice(closingTag + '</think>'.length).trim()
}

export type HermesRunResult = {
  configured: boolean
  message: string
  model?: string
  actions?: HermesAction[]
  toolResults?: HermesToolResult[]
  error?: string
}

function createAdminTools(actions: HermesAction[], toolResults: HermesToolResult[]) {
  const execute = (name: string) => async (params: Record<string, unknown>) => {
    const execution = await executeHermesTool({ tool: name, params })
    toolResults.push(execution.result)
    // Health and report are read-only. Every mutable action is rendered for an
    // explicit Apply confirmation in the dashboard.
    if (name !== 'system_health' && name !== 'get_report') actions.push(execution.action)
    return { message: execution.result.message }
  }

  return {
    draft_email_reply: tool({
      description: 'Prepare a reply to a contact message for Daniel to review and apply.',
      inputSchema: z.object({ messageId: z.string(), subject: z.string(), body: z.string(), tone: z.string().optional() }),
      execute: execute('draft_email_reply'),
    }),
    create_project_draft: tool({
      description: 'Prepare a new portfolio project draft for confirmation.',
      inputSchema: z.object({ id: z.string(), name: z.string(), year: z.string(), category: z.string(), tools: z.string(), description: z.string(), discipline: z.string().optional(), status: z.string().optional(), subtitle: z.string().optional(), role: z.string().optional(), objective: z.string().optional(), approach: z.string().optional(), outcome: z.string().optional(), nextStep: z.string().optional() }),
      execute: execute('create_project_draft'),
    }),
    update_project_draft: tool({
      description: 'Prepare changes to an existing portfolio project for confirmation.',
      inputSchema: z.object({ projectId: z.string(), updates: z.record(z.string(), z.unknown()) }),
      execute: execute('update_project_draft'),
    }),
    reorder_media_draft: tool({
      description: 'Prepare a project media order for confirmation.',
      inputSchema: z.object({ projectId: z.string(), order: z.array(z.string()) }),
      execute: execute('reorder_media_draft'),
    }),
    add_project_link_draft: tool({
      description: 'Prepare a portfolio project link for confirmation.',
      inputSchema: z.object({ projectId: z.string(), label: z.string(), url: z.string().url(), type: z.enum(['github', 'demo', 'notebook', 'video', 'kaggle']) }),
      execute: execute('add_project_link_draft'),
    }),
    mark_message_read: tool({
      description: 'Prepare marking a contact message as read for confirmation.',
      inputSchema: z.object({ messageId: z.string() }),
      execute: execute('mark_message_read'),
    }),
    update_site_copy_draft: tool({
      description: 'Prepare hero or about copy changes for confirmation.',
      inputSchema: z.object({ section: z.enum(['hero', 'about']), updates: z.record(z.string(), z.unknown()) }),
      execute: execute('update_site_copy_draft'),
    }),
    delete_message: tool({
      description: 'Prepare deletion of a contact message for confirmation.',
      inputSchema: z.object({ messageId: z.string() }),
      execute: execute('delete_message'),
    }),
    system_health: tool({
      description: 'Run a read-only health check for AI, email, Telegram, CMS, and contacts.',
      inputSchema: z.object({}),
      execute: execute('system_health'),
    }),
    get_report: tool({
      description: 'Get a read-only summary of projects and messages.',
      inputSchema: z.object({ detail: z.enum(['brief', 'full']).optional() }),
      execute: execute('get_report'),
    }),
  }
}

export async function runHermesChat(mode: HermesMode, messages: HermesChatMessage[]): Promise<HermesRunResult> {
  const config = await getHermesConfig(mode)
  if (!config.apiKey || !config.model) {
    return { configured: false, message: 'The live assistant is not configured yet.', model: config.model }
  }

  const system = mode === 'admin'
    ? await buildAdminHermesSystemPrompt()
    : await buildPublicHermesSystemPrompt()
  const provider = createOpenAICompatible({
    name: config.provider,
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    // Kimi Code may spend the entire response budget on hidden reasoning for
    // simple dashboard tasks. Disable it so tool calls and concise replies
    // arrive within the UI timeout.
    transformRequestBody: (body) => (
      config.provider === 'cloudflare-workers-ai' && config.model.includes('kimi-k2.7')
        ? { ...body, chat_template_kwargs: { thinking: false } }
        : body
    ),
  })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), mode === 'public' ? 12_000 : 24_000)
  const actions: HermesAction[] = []
  const toolResults: HermesToolResult[] = []

  try {
    const result = await generateText({
      model: provider(config.model),
      system,
      messages: cleanMessages(messages),
      maxOutputTokens: mode === 'public' ? 220 : 700,
      temperature: 0.3,
      maxRetries: 0,
      abortSignal: controller.signal,
      ...(mode === 'admin' ? { tools: createAdminTools(actions, toolResults), stopWhen: stepCountIs(3) } : {}),
    })
    const fallbackText = toolResults.map((item) => item.message).join('\n')
    const outputText = config.model.includes('kimi-k2.7') ? stripKimiThinking(result.text) : result.text.trim()
    const message = (outputText || fallbackText || 'Done.').trim()
    return {
      configured: true,
      message: mode === 'public' ? sanitizePublicHermesResponse(message) : message,
      model: config.model,
      actions: actions.length ? actions : undefined,
      toolResults: toolResults.length ? toolResults : undefined,
    }
  } finally {
    clearTimeout(timeout)
  }
}
