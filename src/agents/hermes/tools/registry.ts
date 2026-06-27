import type { HermesToolDefinition } from './types'

export const hermesToolRegistry: Record<string, HermesToolDefinition> = {
  draft_email_reply: {
    name: 'draft_email_reply',
    description: 'Draft a reply email to a contact message. Always asks for confirmation before sending.',
    permission: 'draft',
    parameters: [
      { name: 'messageId', type: 'string', required: true, description: 'ID of the contact message to reply to.' },
      { name: 'subject', type: 'string', required: true, description: 'Subject line for the reply.' },
      { name: 'body', type: 'string', required: true, description: 'Full plain-text body of the reply.' },
      { name: 'tone', type: 'string', required: false, description: 'Optional tone: professional, friendly, brief.' },
    ],
  },
  create_project_draft: {
    name: 'create_project_draft',
    description: 'Create a draft for a new portfolio project. Asks for confirmation before adding to the dashboard.',
    permission: 'draft',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'URL-friendly slug/id for the project.' },
      { name: 'name', type: 'string', required: true, description: 'Display name of the project.' },
      { name: 'year', type: 'string', required: true, description: 'Year, e.g. 2025.' },
      { name: 'category', type: 'string', required: true, description: 'Category label.' },
      { name: 'discipline', type: 'string', required: false, description: 'motion | code | data | hybrid' },
      { name: 'status', type: 'string', required: false, description: 'case-study | prototype | experiment | learning-project | showreel | development' },
      { name: 'tools', type: 'string', required: true, description: 'Comma-separated tools used.' },
      { name: 'description', type: 'string', required: true, description: 'Short description.' },
      { name: 'subtitle', type: 'string', required: false, description: 'One-line subtitle.' },
      { name: 'role', type: 'string', required: false, description: 'Role on the project.' },
      { name: 'objective', type: 'string', required: false, description: 'Project objective.' },
      { name: 'approach', type: 'string', required: false, description: 'Approach and process.' },
      { name: 'outcome', type: 'string', required: false, description: 'Outcome and results.' },
      { name: 'nextStep', type: 'string', required: false, description: 'Next step or future work.' },
    ],
  },
  update_project_draft: {
    name: 'update_project_draft',
    description: 'Draft changes to an existing project. Asks for confirmation before applying.',
    permission: 'draft',
    parameters: [
      { name: 'projectId', type: 'string', required: true, description: 'ID/slug of the project to update.' },
      { name: 'updates', type: 'string', required: true, description: 'JSON object with the fields to update.' },
    ],
  },
  reorder_media_draft: {
    name: 'reorder_media_draft',
    description: 'Draft a new media order for a project. Asks for confirmation before applying.',
    permission: 'draft',
    parameters: [
      { name: 'projectId', type: 'string', required: true, description: 'ID/slug of the project.' },
      { name: 'order', type: 'string', required: true, description: 'JSON array of media URLs in the desired order.' },
    ],
  },
  add_project_link_draft: {
    name: 'add_project_link_draft',
    description: 'Draft a new link to add to a project. Asks for confirmation before applying.',
    permission: 'draft',
    parameters: [
      { name: 'projectId', type: 'string', required: true, description: 'ID/slug of the project.' },
      { name: 'label', type: 'string', required: true, description: 'Label shown for the link.' },
      { name: 'url', type: 'string', required: true, description: 'URL.' },
      { name: 'type', type: 'string', required: true, description: 'github | demo | notebook | video | kaggle' },
    ],
  },
  mark_message_read: {
    name: 'mark_message_read',
    description: 'Mark a contact message as read. Low-risk; can be applied immediately.',
    permission: 'apply',
    parameters: [
      { name: 'messageId', type: 'string', required: true, description: 'ID of the contact message.' },
    ],
  },
  update_site_copy_draft: {
    name: 'update_site_copy_draft',
    description: 'Draft changes to hero or about copy. Asks for confirmation before applying.',
    permission: 'draft',
    parameters: [
      { name: 'section', type: 'string', required: true, description: 'hero | about' },
      { name: 'updates', type: 'string', required: true, description: 'JSON object with the fields to update.' },
    ],
  },
}

export function getToolDefinition(name: string): HermesToolDefinition | undefined {
  return hermesToolRegistry[name]
}

export function listToolDefinitions(): HermesToolDefinition[] {
  return Object.values(hermesToolRegistry)
}
