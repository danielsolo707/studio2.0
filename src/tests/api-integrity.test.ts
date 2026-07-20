import { describe, expect, it } from 'vitest'
import { listToolDefinitions, getToolDefinition } from '@/agents/hermes/tools/registry'
import { executeHermesTool } from '@/agents/hermes/tools/executor'

describe('API — tool registry integrity', () => {
  const expectedTools = [
    'draft_email_reply', 'create_project_draft', 'update_project_draft',
    'reorder_media_draft', 'add_project_link_draft', 'mark_message_read',
    'update_site_copy_draft', 'system_health', 'get_report', 'delete_message',
  ]

  it('all expected tools are registered', () => {
    const tools = listToolDefinitions()
    for (const name of expectedTools) {
      expect(getToolDefinition(name)).toBeDefined()
    }
    expect(tools.length).toBeGreaterThanOrEqual(expectedTools.length)
  })

  it('system_health executes successfully', async () => {
    const result = await executeHermesTool({ tool: 'system_health', params: {} })
    expect(result.result.type).toBe('applied')
    expect(result.result.message).toContain('System health')
  })

  it('get_report executes successfully', async () => {
    const result = await executeHermesTool({ tool: 'get_report', params: {} })
    expect(result.result.type).toBe('applied')
    expect(result.result.message).toContain('projects')
  })

  it('unknown tool returns error', async () => {
    const result = await executeHermesTool({ tool: 'nonexistent', params: {} })
    expect(result.result.type).toBe('error')
  })

  it('mark_message_read returns error for missing message', async () => {
    const result = await executeHermesTool({ tool: 'mark_message_read', params: { messageId: 'no-such-id' } })
    expect(result.result.type).toBe('error')
  })

  it('delete_message returns draft for missing message', async () => {
    const result = await executeHermesTool({ tool: 'delete_message', params: { messageId: 'no-such-id' } })
    expect(result.result.type).toBe('error')
    expect(result.result.message).toContain('not found')
  })
})

describe('API — Hermes action handler', () => {
  it('action handler catches errors gracefully (auth fails in test)', async () => {
    const { applyHermesAction } = await import('@/app/dashboard/hermes/actions')
    const result = await applyHermesAction({ kind: 'system_health', id: 'test-id' })
    // In test there's no request context, so auth throws.
    // The handler catches it and returns { status: 'failed', error: '...' }
    expect(result.status).toBe('failed')
    expect(typeof result.error).toBe('string')
  })

  it('mark_message_read action handler catches errors gracefully', async () => {
    const { applyHermesAction } = await import('@/app/dashboard/hermes/actions')
    const result = await applyHermesAction({ kind: 'mark_message_read', id: 'test-id', messageId: 'fake' })
    expect(result.status).toBe('failed')
    expect(typeof result.error).toBe('string')
  })
})
