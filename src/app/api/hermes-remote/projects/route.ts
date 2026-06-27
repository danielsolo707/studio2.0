import { NextResponse } from 'next/server'
import { readContent, addProject, updateProject } from '@/lib/cms/content'
import {
  hermesRemoteDisabledResponse,
  unauthorizedHermesResponse,
  validateHermesRemoteSecret,
} from '@/lib/security/hermes-remote'
import type { Project } from '@/types/project'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      secret?: string
      action?: 'list' | 'create' | 'update'
      project?: Project
      projectId?: string
      updates?: Partial<Project>
    }

    if (!validateHermesRemoteSecret(body)) {
      return unauthorizedHermesResponse()
    }

    const content = await readContent()

    if (body.action === 'list' || !body.action) {
      return NextResponse.json({ projects: content.projects })
    }

    if (body.action === 'create') {
      if (!body.project) {
        return NextResponse.json({ error: 'Missing project' }, { status: 400 })
      }
      if (content.projects.some((p) => p.id === body.project!.id)) {
        return NextResponse.json({ error: 'Project ID already exists' }, { status: 409 })
      }
      await addProject(body.project)
      return NextResponse.json({ success: true, project: body.project })
    }

    if (body.action === 'update') {
      if (!body.projectId || !body.updates) {
        return NextResponse.json({ error: 'Missing projectId or updates' }, { status: 400 })
      }
      if (!content.projects.some((p) => p.id === body.projectId)) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      await updateProject(body.projectId, body.updates)
      return NextResponse.json({ success: true, projectId: body.projectId, updates: body.updates })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return hermesRemoteDisabledResponse()
}
