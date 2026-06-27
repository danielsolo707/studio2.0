import { NextResponse } from 'next/server'
import { listMessages, appendReply, updateMessage } from '@/lib/contact/contact-log'
import {
  hermesRemoteDisabledResponse,
  unauthorizedHermesResponse,
  validateHermesRemoteSecret,
} from '@/lib/security/hermes-remote'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      secret?: string
      action?: 'list' | 'reply' | 'mark-read'
      limit?: number
      messageId?: string
      subject?: string
      body?: string
      to?: string
    }

    if (!validateHermesRemoteSecret(body)) {
      return unauthorizedHermesResponse()
    }

    if (body.action === 'list' || !body.action) {
      const messages = await listMessages(body.limit || 50)
      return NextResponse.json({ messages })
    }

    if (body.action === 'reply') {
      if (!body.messageId || !body.subject || !body.body || !body.to) {
        return NextResponse.json({ error: 'Missing reply fields' }, { status: 400 })
      }
      await appendReply(body.messageId, {
        id: crypto.randomUUID(),
        to: body.to,
        subject: body.subject,
        body: body.body,
        sentAt: new Date().toISOString(),
        sent: false,
      })
      await updateMessage(body.messageId, { isRead: true })
      return NextResponse.json({ success: true })
    }

    if (body.action === 'mark-read') {
      if (!body.messageId) {
        return NextResponse.json({ error: 'Missing messageId' }, { status: 400 })
      }
      await updateMessage(body.messageId, { isRead: true })
      return NextResponse.json({ success: true })
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
