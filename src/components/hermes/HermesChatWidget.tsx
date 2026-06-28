"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-white/50">
      <span className="text-xs">Thinking</span>
      <span className="flex gap-0.5">
        <span className="h-1 w-1 animate-bounce rounded-full bg-[#DFFF00] [animation-delay:0ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-[#DFFF00] [animation-delay:150ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-[#DFFF00] [animation-delay:300ms]" />
      </span>
    </div>
  )
}

function MessageBubble({ message, isUser }: { message: HermesChatMessage; isUser: boolean }) {
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      dir="auto"
    >
      <div
        dir="auto"
        className={`bidi-plaintext max-w-[85%] whitespace-pre-wrap px-4 py-2.5 text-[15px] leading-relaxed transition-all ${
          isUser
            ? 'rounded-2xl rounded-tr-sm border border-[#DFFF00]/25 bg-[#DFFF00]/15 text-white shadow-[0_2px_12px_rgba(223,255,0,0.08)]'
            : 'rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.05] text-white/85 shadow-sm'
        }`}
      >
        {message.content}
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const displayTitle = title || (mode === 'admin' ? 'Hermes' : 'Studio Assistant')
  const displaySubtitle = subtitle || (mode === 'admin' ? 'Dashboard agent' : 'Chat with me about the work')

  const panelClass = useMemo(
    () =>
      floating
        ? 'fixed bottom-6 right-4 z-[240] w-[min(calc(100vw-2rem),420px)]'
        : 'w-full',
    [floating],
  )

  const adjustTextareaHeight = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 48), 160)}px`
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isPending, error, scrollToBottom])

  const updateActionStatus = useCallback(
    (id: string, status: HermesActionStatus, error?: string) => {
      setActions((prev) => prev.map((action) => (action.id === id ? { ...action, status, error } : action)))
    },
    [],
  )

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isPending) return

    const nextMessages: HermesChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsPending(true)

    // Reset textarea height after sending
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

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
    <section className="font-persian overflow-hidden rounded-2xl border border-white/10 bg-[#050507]/96 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#DFFF00]/30 bg-[#DFFF00]/10 text-[#DFFF00] shadow-[0_0_16px_rgba(223,255,0,0.12)]">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-headline text-xs tracking-[0.2em] text-white">{displayTitle}</h2>
            <p className="truncate text-[11px] text-white/45">{displaySubtitle}</p>
          </div>
        </div>
        {floating && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:bg-white/5 hover:text-white"
            aria-label="Close assistant"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </header>

      <div className="max-h-[420px] min-h-[300px] space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
              <p className="text-sm leading-relaxed text-white/65">
                {mode === 'admin'
                  ? 'Ask Hermes to draft, summarize, or plan dashboard changes. It will not apply sensitive changes without confirmation.'
                  : 'Ask about projects, skills, or whether an idea fits. I\'ll keep it short.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {starterPrompts[mode].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-left text-[12px] text-white/60 transition-all hover:border-[#DFFF00]/40 hover:bg-[#DFFF00]/5 hover:text-[#DFFF00]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={`${message.role}-${index}`} message={message} isUser={message.role === 'user'} />
        ))}

        {actions.length > 0 && mode === 'admin' && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Proposed actions</p>
            {actions.map((action) => (
              <ActionCard key={action.id} action={action} onStatusChange={updateActionStatus} />
            ))}
          </div>
        )}

        {isPending && <TypingIndicator />}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        className="border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault()
          sendMessage(input)
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              adjustTextareaHeight()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                sendMessage(input)
              }
            }}
            rows={1}
            dir="auto"
            placeholder={mode === 'admin' ? 'Ask Hermes...' : 'Ask about the work...'}
            className="bidi-plaintext min-h-[48px] flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition-all placeholder:text-white/25 focus:border-[#DFFF00]/60 focus:bg-black/60"
          />
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00] text-black shadow-[0_4px_20px_rgba(223,255,0,0.25)] transition-all hover:scale-105 hover:shadow-[0_6px_28px_rgba(223,255,0,0.35)] active:scale-95 disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
            aria-label="Send message"
          >
            <Send size={18} aria-hidden="true" className="ml-0.5" />
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
          className="fixed bottom-6 right-4 z-[240] flex h-14 items-center gap-3 rounded-full border border-[#DFFF00]/30 bg-[#050507]/90 px-5 text-[#DFFF00] shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all hover:scale-105 hover:bg-[#DFFF00] hover:text-black"
          aria-label={`Open ${displayTitle}`}
        >
          <Bot size={20} aria-hidden="true" />
          <span className="font-headline text-[10px] tracking-[0.22em]">{displayTitle}</span>
        </button>
      )}
      {isOpen && <div className={panelClass}>{panel}</div>}
    </>
  )
}
