import crypto from 'crypto'
import { listMessages, updateMessage } from '@/lib/contact/contact-log'
import { readContent } from '@/lib/cms/content'
import type { Project, ProjectDiscipline, ProjectLinkType, ProjectStatus } from '@/types/project'
import type { HermesAction, HermesToolCall, HermesToolResult } from './types'
import { getToolDefinition } from './registry'

const VALID_DISCIPLINES = new Set<string>(['motion', 'code', 'data', 'hybrid'])
const VALID_STATUSES = new Set<string>([
  'case-study',
  'prototype',
  'experiment',
  'learning-project',
  'showreel',
  'development',
])
const VALID_LINK_TYPES = new Set<string>(['github', 'demo', 'notebook', 'video', 'kaggle'])

function assertString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Parameter "${field}" must be a non-empty string`)
  }
  return value.trim()
}

function assertOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return undefined
  return value.trim() || undefined
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
  } catch {
    // fall through
  }
  throw new Error('Parameter must be a valid JSON object')
}

function parseJsonArray(value: unknown): unknown[] {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // fall through
  }
  throw new Error('Parameter must be a valid JSON array')
}

function sanitizeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function createActionId(): string {
  return crypto.randomUUID()
}

async function executeDraftEmailReply(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const messageId = assertString(params.messageId, 'messageId')
  const subject = assertString(params.subject, 'subject')
  const body = assertString(params.body, 'body')
  const messages = await listMessages(200)
  const message = messages.find((m) => m.id === messageId)
  if (!message) {
    return {
      result: { type: 'error', message: `Contact message ${messageId} not found.` },
      action: { kind: 'draft_email_reply', id: createActionId(), messageId, to: '', subject, body },
    }
  }

  const action: HermesAction = {
    kind: 'draft_email_reply',
    id: createActionId(),
    messageId,
    to: message.email,
    subject,
    body,
  }

  return {
    result: {
      type: 'draft',
      message: `Draft reply to ${message.name} <${message.email}> ready for review.`,
      payload: action,
    },
    action,
  }
}

async function executeCreateProjectDraft(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const rawId = assertString(params.id, 'id')
  const id = sanitizeId(rawId)
  const content = await readContent()
  if (content.projects.some((p) => p.id === id)) {
    return {
      result: { type: 'error', message: `A project with id "${id}" already exists.` },
      action: { kind: 'create_project_draft', id: createActionId(), project: { id } as Project },
    }
  }

  const project: Project = {
    id,
    name: assertString(params.name, 'name'),
    year: assertString(params.year, 'year'),
    color: '#DFFF00',
    imageUrl: '',
    description: assertString(params.description, 'description'),
    subtitle: assertOptionalString(params.subtitle),
    tools: assertString(params.tools, 'tools'),
    category: assertString(params.category, 'category'),
    discipline: VALID_DISCIPLINES.has(String(params.discipline || '')) ? (params.discipline as ProjectDiscipline) : 'hybrid',
    status: VALID_STATUSES.has(String(params.status || '')) ? (params.status as ProjectStatus) : 'prototype',
    role: assertOptionalString(params.role),
    objective: assertOptionalString(params.objective),
    approach: assertOptionalString(params.approach),
    outcome: assertOptionalString(params.outcome),
    nextStep: assertOptionalString(params.nextStep),
    media: [],
    links: [],
  }

  const action: HermesAction = { kind: 'create_project_draft', id: createActionId(), project }
  return {
    result: {
      type: 'draft',
      message: `Draft project "${project.name}" (${project.id}) ready for confirmation.`,
      payload: action,
    },
    action,
  }
}

async function executeUpdateProjectDraft(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const projectId = assertString(params.projectId, 'projectId')
  const updatesRaw = parseJsonObject(params.updates)
  const content = await readContent()
  const existing = content.projects.find((p) => p.id === projectId)
  if (!existing) {
    return {
      result: { type: 'error', message: `Project "${projectId}" not found.` },
      action: { kind: 'update_project_draft', id: createActionId(), projectId, updates: {} },
    }
  }

  const updates: Partial<Project> = {}
  if (updatesRaw.name) updates.name = String(updatesRaw.name)
  if (updatesRaw.year) updates.year = String(updatesRaw.year)
  if (updatesRaw.category) updates.category = String(updatesRaw.category)
  if (updatesRaw.tools) updates.tools = String(updatesRaw.tools)
  if (updatesRaw.description) updates.description = String(updatesRaw.description)
  if (updatesRaw.subtitle !== undefined) updates.subtitle = String(updatesRaw.subtitle)
  if (updatesRaw.role !== undefined) updates.role = String(updatesRaw.role)
  if (updatesRaw.objective !== undefined) updates.objective = String(updatesRaw.objective)
  if (updatesRaw.approach !== undefined) updates.approach = String(updatesRaw.approach)
  if (updatesRaw.outcome !== undefined) updates.outcome = String(updatesRaw.outcome)
  if (updatesRaw.nextStep !== undefined) updates.nextStep = String(updatesRaw.nextStep)
  if (VALID_DISCIPLINES.has(String(updatesRaw.discipline || ''))) updates.discipline = updatesRaw.discipline as ProjectDiscipline
  if (VALID_STATUSES.has(String(updatesRaw.status || ''))) updates.status = updatesRaw.status as ProjectStatus

  const action: HermesAction = { kind: 'update_project_draft', id: createActionId(), projectId, updates }
  return {
    result: {
      type: 'draft',
      message: `Draft update for "${existing.name}" ready for confirmation.`,
      payload: action,
    },
    action,
  }
}

async function executeReorderMediaDraft(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const projectId = assertString(params.projectId, 'projectId')
  const order = parseJsonArray(params.order).map((item) => String(item))
  const content = await readContent()
  const existing = content.projects.find((p) => p.id === projectId)
  if (!existing) {
    return {
      result: { type: 'error', message: `Project "${projectId}" not found.` },
      action: { kind: 'reorder_media_draft', id: createActionId(), projectId, order },
    }
  }

  const action: HermesAction = { kind: 'reorder_media_draft', id: createActionId(), projectId, order }
  return {
    result: {
      type: 'draft',
      message: `Draft media reorder for "${existing.name}" ready for confirmation.`,
      payload: action,
    },
    action,
  }
}

async function executeAddProjectLinkDraft(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const projectId = assertString(params.projectId, 'projectId')
  const label = assertString(params.label, 'label')
  const url = assertString(params.url, 'url')
  const type = assertString(params.type, 'type')
  const content = await readContent()
  const existing = content.projects.find((p) => p.id === projectId)
  if (!existing) {
    return {
      result: { type: 'error', message: `Project "${projectId}" not found.` },
      action: { kind: 'add_project_link_draft', id: createActionId(), projectId, link: { label, url, type: 'demo' as ProjectLinkType } },
    }
  }
  if (!VALID_LINK_TYPES.has(type)) {
    return {
      result: { type: 'error', message: `Invalid link type "${type}".` },
      action: { kind: 'add_project_link_draft', id: createActionId(), projectId, link: { label, url, type: 'demo' as ProjectLinkType } },
    }
  }

  const action: HermesAction = {
    kind: 'add_project_link_draft',
    id: createActionId(),
    projectId,
    link: { label, url, type: type as ProjectLinkType },
  }
  return {
    result: {
      type: 'draft',
      message: `Draft link "${label}" for "${existing.name}" ready for confirmation.`,
      payload: action,
    },
    action,
  }
}

async function executeMarkMessageRead(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const messageId = assertString(params.messageId, 'messageId')
  const messages = await listMessages(200)
  const message = messages.find((m) => m.id === messageId)
  if (!message) {
    return {
      result: { type: 'error', message: `Contact message ${messageId} not found.` },
      action: { kind: 'mark_message_read', id: createActionId(), messageId },
    }
  }

  await updateMessage(messageId, { isRead: true })
  const action: HermesAction = { kind: 'mark_message_read', id: createActionId(), messageId }
  return {
    result: { type: 'applied', message: `Marked message from ${message.name} as read.` },
    action,
  }
}

async function executeUpdateSiteCopyDraft(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const section = assertString(params.section, 'section')
  if (section !== 'hero' && section !== 'about') {
    return {
      result: { type: 'error', message: `Section must be "hero" or "about", got "${section}".` },
      action: { kind: 'update_site_copy_draft', id: createActionId(), section: 'hero', updates: {} },
    }
  }
  const updates = parseJsonObject(params.updates)

  const action: HermesAction = { kind: 'update_site_copy_draft', id: createActionId(), section, updates }
  return {
    result: {
      type: 'draft',
      message: `Draft ${section} copy update ready for confirmation.`,
      payload: action,
    },
    action,
  }
}

async function executeSystemHealth(): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const checks: string[] = []

  // OpenRouter
  checks.push(`OpenRouter key: ${process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING'}`)
  checks.push(`Model: ${process.env.OPENROUTER_MODEL || process.env.HERMES_MODEL || 'openrouter/owl-alpha'}`)

  // Resend
  checks.push(`Resend key: ${process.env.RESEND_API_KEY ? 'SET' : 'MISSING'}`)
  checks.push(`Resend from: ${process.env.RESEND_FROM || 'MISSING'}`)

  // Telegram
  checks.push(`Telegram: ${process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID ? 'CONFIGURED' : 'NOT SET'}`)

  // CMS file
  try {
    const content = await readContent()
    checks.push(`CMS: OK (${content.projects.length} projects)`)
  } catch {
    checks.push('CMS: ERROR — cannot read content')
  }

  // Contact log
  try {
    const messages = await listMessages(1)
    checks.push(`Contact log: OK (${messages.length === 1 ? 'accessible' : 'accessible'})`)
  } catch {
    checks.push('Contact log: ERROR')
  }

  const message = `System health:\n${checks.map((c) => `  • ${c}`).join('\n')}`
  return {
    result: { type: 'applied', message },
    action: { kind: 'mark_message_read', id: createActionId(), messageId: '' },
  }
}

async function executeGetReport(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const content = await readContent()
  const messages = await listMessages(200)
  const unread = messages.filter((m) => !m.isRead).length
  const totalMessages = messages.length

  const motionCount = content.projects.filter((p) => p.discipline === 'motion').length
  const codeCount = content.projects.filter((p) => p.discipline === 'code').length

  const report = [
    `Total projects: ${content.projects.length}`,
    `  Motion: ${motionCount}`,
    `  Code: ${codeCount}`,
    `Messages: ${totalMessages} total, ${unread} unread`,
  ]

  return {
    result: {
      type: 'applied',
      message: report.join('\n'),
    },
    action: { kind: 'mark_message_read', id: createActionId(), messageId: '' },
  }
}

async function executeDeleteMessage(params: Record<string, unknown>): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const messageId = assertString(params.messageId, 'messageId')
  const messages = await listMessages(200)
  const message = messages.find((m) => m.id === messageId)
  if (!message) {
    const action: HermesAction = { kind: 'delete_message', id: createActionId(), messageId }
    return {
      result: { type: 'error', message: `Message ${messageId} not found.` },
      action,
    }
  }

  const action: HermesAction = { kind: 'delete_message', id: createActionId(), messageId }
  return {
    result: {
      type: 'draft',
      message: `Delete message from ${message.name} <${message.email}>? This cannot be undone.`,
      payload: action,
    },
    action,
  }
}

export async function executeHermesTool(call: HermesToolCall): Promise<{ result: HermesToolResult; action: HermesAction }> {
  const definition = getToolDefinition(call.tool)
  if (!definition) {
    const action: HermesAction = { kind: 'mark_message_read', id: createActionId(), messageId: '' }
    return {
      result: { type: 'error', message: `Unknown tool "${call.tool}".` },
      action,
    }
  }

  switch (call.tool) {
    case 'draft_email_reply':
      return executeDraftEmailReply(call.params)
    case 'create_project_draft':
      return executeCreateProjectDraft(call.params)
    case 'update_project_draft':
      return executeUpdateProjectDraft(call.params)
    case 'reorder_media_draft':
      return executeReorderMediaDraft(call.params)
    case 'add_project_link_draft':
      return executeAddProjectLinkDraft(call.params)
    case 'mark_message_read':
      return executeMarkMessageRead(call.params)
    case 'update_site_copy_draft':
      return executeUpdateSiteCopyDraft(call.params)
    case 'system_health':
      return executeSystemHealth()
    case 'get_report':
      return executeGetReport(call.params)
    case 'delete_message':
      return executeDeleteMessage(call.params)
    default:
      return {
        result: { type: 'error', message: `Tool "${call.tool}" is registered but not implemented.` },
        action: { kind: 'mark_message_read', id: createActionId(), messageId: '' },
      }
  }
}
