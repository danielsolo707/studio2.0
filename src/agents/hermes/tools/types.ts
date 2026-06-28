import type { Project, ProjectLink } from '@/types/project'

export type HermesToolPermission = 'read' | 'draft' | 'apply'

export type HermesToolResult =
  | { type: 'draft'; message: string; payload: unknown }
  | { type: 'applied'; message: string }
  | { type: 'info'; message: string }
  | { type: 'error'; message: string }

export type HermesToolParameter = {
  name: string
  type: 'string' | 'number' | 'boolean'
  required: boolean
  description: string
}

export type HermesToolDefinition = {
  name: string
  description: string
  permission: HermesToolPermission
  parameters: HermesToolParameter[]
}

export type HermesToolCall = {
  tool: string
  params: Record<string, unknown>
}

export type HermesAction =
  | { kind: 'draft_email_reply'; id: string; messageId: string; to: string; subject: string; body: string }
  | { kind: 'create_project_draft'; id: string; project: Project }
  | { kind: 'update_project_draft'; id: string; projectId: string; updates: Partial<Project> }
  | { kind: 'reorder_media_draft'; id: string; projectId: string; order: string[] }
  | { kind: 'add_project_link_draft'; id: string; projectId: string; link: ProjectLink }
  | { kind: 'mark_message_read'; id: string; messageId: string }
  | { kind: 'update_site_copy_draft'; id: string; section: 'hero' | 'about'; updates: Partial<Record<string, unknown>> }
  | { kind: 'delete_message'; id: string; messageId: string }
  | { kind: 'system_health'; id: string }
  | { kind: 'get_report'; id: string }

export type HermesActionStatus = 'pending' | 'applied' | 'rejected' | 'failed'

export type HermesActionWithStatus = HermesAction & {
  status: HermesActionStatus
  error?: string
}
