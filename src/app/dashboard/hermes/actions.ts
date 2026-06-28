'use server'

import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { addProject, readContent, updateHero, updateAbout, updateProject } from '@/lib/cms/content'
import { appendReply, updateMessage } from '@/lib/contact/contact-log'
import type { HermesAction, HermesActionStatus } from '@/agents/hermes/tools/types'

export type ApplyActionState = {
  status: HermesActionStatus
  error?: string
}

function createReplyId(): string {
  return crypto.randomUUID()
}

async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
}

async function getProjectById(projectId: string) {
  const content = await readContent()
  return content.projects.find((p) => p.id === projectId)
}

export async function applyHermesAction(action: HermesAction): Promise<ApplyActionState> {
  try {
    await requireAuth()

    switch (action.kind) {
      case 'draft_email_reply': {
        // Try sending via Resend, fall back to draft-only if not configured
        let sent = false
        const apiKey = process.env.RESEND_API_KEY
        const from = process.env.RESEND_FROM
        if (apiKey && from) {
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                from,
                to: action.to,
                subject: action.subject,
                text: action.body,
              }),
            })
            sent = res.ok
          } catch {
            sent = false
          }
        }

        await appendReply(action.messageId, {
          id: createReplyId(),
          to: action.to,
          subject: action.subject,
          body: action.body,
          sentAt: new Date().toISOString(),
          sent,
        })
        await updateMessage(action.messageId, { isRead: true })
        revalidatePath('/dashboard/messages')
        revalidatePath('/dashboard')
        return { status: 'applied' }
      }

      case 'create_project_draft': {
        await addProject(action.project)
        revalidatePath('/')
        revalidatePath('/dashboard')
        revalidatePath('/projects')
        revalidatePath(`/projects/${action.project.id}`)
        return { status: 'applied' }
      }

      case 'update_project_draft': {
        await updateProject(action.projectId, action.updates)
        revalidatePath('/')
        revalidatePath('/dashboard')
        revalidatePath('/projects')
        revalidatePath(`/projects/${action.projectId}`)
        return { status: 'applied' }
      }

      case 'reorder_media_draft': {
        const project = await getProjectById(action.projectId)
        if (!project) return { status: 'failed', error: 'Project not found' }
        const orderSet = new Set(action.order)
        const reordered = action.order
          .map((url) => project.media?.find((m) => m.url === url))
          .filter(Boolean) as NonNullable<typeof project.media>
        const remaining = (project.media || []).filter((m) => !orderSet.has(m.url))
        await updateProject(action.projectId, { media: [...reordered, ...remaining] })
        revalidatePath('/')
        revalidatePath('/dashboard')
        revalidatePath(`/projects/${action.projectId}`)
        return { status: 'applied' }
      }

      case 'add_project_link_draft': {
        const project = await getProjectById(action.projectId)
        if (!project) return { status: 'failed', error: 'Project not found' }
        const links = [...(project.links || []), action.link]
        await updateProject(action.projectId, { links })
        revalidatePath('/')
        revalidatePath('/dashboard')
        revalidatePath(`/projects/${action.projectId}`)
        return { status: 'applied' }
      }

      case 'mark_message_read': {
        await updateMessage(action.messageId, { isRead: true })
        revalidatePath('/dashboard/messages')
        revalidatePath('/dashboard')
        return { status: 'applied' }
      }

      case 'update_site_copy_draft': {
        if (action.section === 'hero') {
          await updateHero(action.updates as { headline?: string; description?: string })
        } else {
          await updateAbout(action.updates as { headline?: string; body?: string; skills?: string[]; label?: string })
        }
        revalidatePath('/')
        revalidatePath('/dashboard')
        return { status: 'applied' }
      }

      default: {
        const _exhaustive: never = action
        return { status: 'failed', error: `Unsupported action kind: ${JSON.stringify(_exhaustive)}` }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { status: 'failed', error: message }
  }
}
