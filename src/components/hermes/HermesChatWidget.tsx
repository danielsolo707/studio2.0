"use client"

import { useCallback, useMemo, useRef, useState } from 'react'
import { Bot, Check, Pencil, Send, Sparkles, Trash2, X } from 'lucide-react'
import { applyHermesAction } from '@/app/dashboard/hermes/actions'
import type { HermesChatMessage, HermesMode } from '@/agents/hermes/schemas/chat'
import type { HermesAction, HermesActionStatus, HermesActionWithStatus } from '@/agents/hermes/tools/types'

type HermesChatWidgetProps = {
  mode: HermesMode
  title?: string
  subtitle?: string
  floating?: boolean
  defaultOpen?: boolean
}

const starterPrompts = {
  public: [
    'What kind of projects does Daniel build?',
    'Which project should I look at first?',
    'How can I contact Daniel about a project?',
  ],
  admin: [
    'Summarize my latest messages.',
    'Draft a polite reply to a potential client.',
    'Help me plan a new motion project entry.',
  ],
}

function getActionTitle(action: HermesAction): string {
  switch (action.kind) {
    case 'draft_email_reply':
      return `Reply to ${action.to}`
    case 'create_project_draft':
      return `Create project "${action.project.name}"`
    case 'update_project_draft':
      return `Update project "${action.projectId}"`
    case 'reorder_media_draft':
      return `Reorder media for "${action.projectId}"`
    case 'add_project_link_draft':
      return `Add link to "${action.projectId}"`
    case 'mark_message_read':
      return 'Mark message read'
    case 'update_site_copy_draft':
      return `Update ${action.section} copy`
    default:
      return 'Action'
  }
}

function ActionCard({
  action,
  onStatusChange,
}: {
  action: HermesActionWithStatus
  onStatusChange: (id: string, status: HermesActionStatus, error?: string) => void
}) {
  const [isPending, setIsPending] = useState(false)

  const handleApply = async () => {
    setIsPending(true)
    const result = await applyHermesAction(action)
    setIsPending(false)
    onStatusChange(action.id, result.status, result.error)
  }

  const handleReject = () => {
    onStatusChange(action.id, 'rejected')
  }

  if (action.status === 'applied') {
    return (
      <div className="rounded border border-[#DFFF00]/30 bg-[#DFFF00]/10 px-3 py-2 text-xs text-[#DFFF00]">
        Applied: {getActionTitle(action)}
      </div>
    )
  }

  if (action.status === 'rejected') {
    return (
      <div className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/40 line-through">
        Rejected: {getActionTitle(action)}
      </div>
    )
  }

  if (action.status === 'failed') {
    return (
      <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
        Failed: {getActionTitle(action)} — {action.error || 'Unknown error'}
      </div>
    )
  }

  return (
    <div className="rounded border border-[#DFFF00]/25 bg-[#DFFF00]/5 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#DFFF00]">{getActionTitle(action)}</span>
        <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/40">
          Draft
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded bg-[#DFFF00] px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Check size={11} aria-hidden="true" />
          Apply
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded border border-white/15 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
        >
          <X size={11} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </div>
  )
}

export function HermesChatWidget({
  mode,
  title,
  subtitle,
  floating = true,
  defaultOpen = false,
}: HermesChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [input, setInput] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<HermesChatMessage[]>([])
  const [actions, setActions] = useState<HermesActionWithStatus[]>([])
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const displayTitle = title || (mode === 'admin' ? 'Hermes' : 'Studio Assistant')
  const displaySubtitle = subtitle || (mode === 'admin' ? 'Dashboard agent' : 'Ask about Daniel and the work')

  const panelClass = useMemo(() => (
    floating
      ? 'fixed bottom-6 right-4 z-[240] w-[min(calc(100vw-2rem),390px)]'
      : 'w-full'
  ), [floating])

  const updateActionStatus = useCallback((id: string, status: HermesActionStatus, error?: string) => {
    setActions((prev) =>
      prev.map((action) => (action.id === id ? { ...action, status, error } : action)),
    )
  }, [])

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isPending) return

    const nextMessages: HermesChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsPending(true)

    try {
      const res = await fetch('/api/hermes/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode, messages: nextMessages }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Hermes request failed')
      }

      setMessages([...nextMessages, data.message])

      if (Array.isArray(data.actions) && data.actions.length > 0) {
        const incoming: HermesActionWithStatus[] = data.actions.map((action: HermesAction) => ({
          ...action,
          status: 'pending' as HermesActionStatus,
        }))
        setActions((prev) => [...prev, ...incoming])
      }

      if (data.configured === false) {
        setError('Hermes API is not configured yet. Add the Hermes env vars when your provider key is ready.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Hermes request failed'
      setError(message)
      setMessages([...nextMessages, { role: 'assistant', content: `I could not reach Hermes: ${message}` }])
    } finally {
      setIsPending(false)
    }
  }

  const panel = (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[#050507]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#DFFF00]/30 bg-[#DFFF00]/10 text-[#DFFF00]">
              <Sparkles size={15} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-headline text-xs tracking-[0.24em] text-white">{displayTitle}</h2>
              <p className="text-[11px] text-white/45">{displaySubtitle}</p>
            </div>
          </div>
        </div>
        {floating && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded border border-white/10 p-2 text-white/50 transition-colors hover:border-white/30 hover:text-white"
            aria-label="Close assistant"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </header>

      <div className="max-h-[420px] min-h-[280px] space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-white/65">
              {mode === 'admin'
                ? 'Ask Hermes to draft, summarize, or plan dashboard changes. It will not apply sensitive changes without confirmation.'
                : 'Ask about Daniel, selected work, skills, or whether a project idea fits.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {starterPrompts[mode].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded border border-white/10 px-3 py-2 text-left text-[11px] text-white/60 transition-colors hover:border-[#DFFF00]/40 hover:text-[#DFFF00]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${
              message.role === 'user'
                ? 'ml-8 border-[#DFFF00]/25 bg-[#DFFF00]/10 text-white'
                : 'mr-8 border-white/10 bg-white/[0.04] text-white/72'
            }`}
          >
            {message.content}
          </div>
        ))}

        {actions.length > 0 && mode === 'admin' && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Proposed actions</p>
            {actions.map((action) => (
              <ActionCard key={action.id} action={action} onStatusChange={updateActionStatus} />
            ))}
          </div>
        )}

        {isPending && (
          <p className="text-xs text-[#DFFF00]">Thinking...</p>
        )}
        {error && (
          <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>
        )}
      </div>

      <form
        className="border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault()
          sendMessage(input)
        }}
      >
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                sendMessage(input)
              }
            }}
            rows={2}
            placeholder={mode === 'admin' ? 'Ask Hermes...' : 'Ask about the work...'}
            className="min-h-11 flex-1 resize-none rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#DFFF00]/60"
          />
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#DFFF00] text-black transition-opacity disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  )

  if (!floating) return panel

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-4 z-[240] flex h-12 items-center gap-3 rounded-full border border-[#DFFF00]/30 bg-[#050507]/90 px-4 text-[#DFFF00] shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-colors hover:bg-[#DFFF00] hover:text-black"
          aria-label={`Open ${displayTitle}`}
        >
          <Bot size={18} aria-hidden="true" />
          <span className="font-headline text-[10px] tracking-[0.22em]">{displayTitle}</span>
        </button>
      )}
      {isOpen && <div className={panelClass}>{panel}</div>}
    </>
  )
}
