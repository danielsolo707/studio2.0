import OpenAI from 'openai'
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

export type HermesRunResult = {
  configured: boolean
  message: string
  model?: string
  actions?: HermesAction[]
  toolResults?: HermesToolResult[]
  error?: string
}

const ADMIN_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'draft_email_reply',
      description: 'Prepare a reply to a contact message for Daniel to review and apply.',
      parameters: {
        type: 'object',
        properties: {
          messageId: { type: 'string', description: 'ID of the contact message to reply to.' },
          subject: { type: 'string', description: 'Subject line for the reply.' },
          body: { type: 'string', description: 'Full plain-text body of the reply.' },
          tone: { type: 'string', description: 'Optional tone: professional, friendly, brief.' },
        },
        required: ['messageId', 'subject', 'body'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_project_draft',
      description: 'Prepare a new portfolio project draft for confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'URL-friendly slug/id for the project.' },
          name: { type: 'string', description: 'Display name of the project.' },
          year: { type: 'string', description: 'Year, e.g. 2025.' },
          category: { type: 'string', description: 'Category label.' },
          discipline: { type: 'string', description: 'motion | code | data | hybrid' },
          status: { type: 'string', description: 'case-study | prototype | experiment | learning-project | showreel | development' },
          tools: { type: 'string', description: 'Comma-separated tools used.' },
          description: { type: 'string', description: 'Short description.' },
          subtitle: { type: 'string', description: 'One-line subtitle.' },
          role: { type: 'string', description: 'Role on the project.' },
          objective: { type: 'string', description: 'Project objective.' },
          approach: { type: 'string', description: 'Approach and process.' },
          outcome: { type: 'string', description: 'Outcome and results.' },
          nextStep: { type: 'string', description: 'Next step or future work.' },
        },
        required: ['id', 'name', 'year', 'category', 'tools', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_project_draft',
      description: 'Prepare changes to an existing portfolio project for confirmation.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID/slug of the project to update.' },
          updates: { type: 'string', description: 'JSON object with the fields to update.' },
        },
        required: ['projectId', 'updates'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reorder_media_draft',
      description: 'Prepare a project media order for confirmation.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID/slug of the project.' },
          order: { type: 'string', description: 'JSON array of media URLs in the desired order.' },
        },
        required: ['projectId', 'order'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_project_link_draft',
      description: 'Prepare a portfolio project link for confirmation.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID/slug of the project.' },
          label: { type: 'string', description: 'Label shown for the link.' },
          url: { type: 'string', description: 'URL.' },
          type: { type: 'string', enum: ['github', 'demo', 'notebook', 'video', 'kaggle'], description: 'Link type.' },
        },
        required: ['projectId', 'label', 'url', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_message_read',
      description: 'Prepare marking a contact message as read for confirmation.',
      parameters: {
        type: 'object',
        properties: {
          messageId: { type: 'string', description: 'ID of the contact message.' },
        },
        required: ['messageId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_site_copy_draft',
      description: 'Prepare hero or about copy changes for confirmation.',
      parameters: {
        type: 'object',
        properties: {
          section: { type: 'string', enum: ['hero', 'about'], description: 'Section to update.' },
          updates: { type: 'string', description: 'JSON object with the fields to update.' },
        },
        required: ['section', 'updates'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_message',
      description: 'Prepare deletion of a contact message for confirmation.',
      parameters: {
        type: 'object',
        properties: {
          messageId: { type: 'string', description: 'ID of the contact message to delete.' },
        },
        required: ['messageId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'system_health',
      description: 'Run a read-only health check for AI, email, Telegram, CMS, and contacts.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_report',
      description: 'Get a read-only summary of projects and messages.',
      parameters: {
        type: 'object',
        properties: {
          detail: { type: 'string', enum: ['brief', 'full'], description: 'Detail level.' },
        },
      },
    },
  },
]

export async function runHermesChat(mode: HermesMode, messages: HermesChatMessage[]): Promise<HermesRunResult> {
  const config = await getHermesConfig(mode)
  if (!config.apiKey || !config.model) {
    return { configured: false, message: 'The live assistant is not configured yet.', model: config.model }
  }

  const system = mode === 'admin'
    ? await buildAdminHermesSystemPrompt()
    : await buildPublicHermesSystemPrompt()

  const openai = new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), mode === 'public' ? 20_000 : 24_000)
  const actions: HermesAction[] = []
  const toolResults: HermesToolResult[] = []

  try {
    let currentMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      ...cleanMessages(messages),
    ]

    if (mode === 'admin') {
      let stepCount = 0
      const maxSteps = 3

      while (stepCount < maxSteps) {
        const response = await openai.chat.completions.create({
          model: config.model,
          messages: currentMessages,
          tools: ADMIN_TOOLS,
          tool_choice: stepCount === 0 ? 'auto' : 'none',
          max_tokens: 700,
          temperature: 0.3,
        }, { signal: controller.signal })

        const choice = response.choices[0]
        const msg = choice.message

        if (!msg.tool_calls || msg.tool_calls.length === 0) {
          const text = msg.content || ''
          return {
            configured: true,
            message: text.trim(),
            model: config.model,
            actions: actions.length ? actions : undefined,
            toolResults: toolResults.length ? toolResults : undefined,
          }
        }

        for (const toolCall of msg.tool_calls) {
          if (toolCall.type === 'function') {
            const args = JSON.parse(toolCall.function.arguments)
            const execution = await executeHermesTool({ tool: toolCall.function.name, params: args })
            toolResults.push(execution.result)
            if (toolCall.function.name !== 'system_health' && toolCall.function.name !== 'get_report') {
              actions.push(execution.action)
            }
            currentMessages.push(msg)
            currentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: execution.result.message,
            })
          }
        }
        stepCount++
      }

      const finalText = toolResults.map((item) => item.message).join('\n') || 'Done.'
      return {
        configured: true,
        message: finalText.trim(),
        model: config.model,
        actions: actions.length ? actions : undefined,
        toolResults: toolResults.length ? toolResults : undefined,
      }
    }

    // Public mode: simple completion
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: currentMessages,
      max_tokens: 500,
      temperature: 0.3,
    }, { signal: controller.signal })

    const text = response.choices[0]?.message?.content || ''
    return {
      configured: true,
      message: sanitizePublicHermesResponse(text.trim()),
      model: config.model,
    }
  } finally {
    clearTimeout(timeout)
  }
}