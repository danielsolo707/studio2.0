"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight, MessageSquare, User } from 'lucide-react'
import type { ChatSessionWithMessages } from '@/lib/ai/ai-chat-db'

type ChatHistoryProps = {
  publicChats: ChatSessionWithMessages[]
  adminChats: ChatSessionWithMessages[]
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function SessionRow({ session }: { session: ChatSessionWithMessages }) {
  const [expanded, setExpanded] = useState(false)
  const userMessages = session.messages.filter((m) => m.role === 'user').length

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-black/30">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        {expanded ? (
          <ChevronDown size={14} className="text-white/40 shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-white/40 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/70 font-body">
              {formatDate(session.created_at)}
            </span>
            <span className="text-[9px] font-headline tracking-wider text-white/40">
              {userMessages} MSG{userMessages === 1 ? '' : 'S'}
            </span>
            {session.ip && (
              <span className="text-[9px] font-mono text-white/30">
                IP: {session.ip}
              </span>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/10 px-4 py-3 space-y-3 max-h-[400px] overflow-y-auto">
          {session.messages.length === 0 && (
            <p className="text-[11px] text-white/30 font-body">No messages.</p>
          )}
          {session.messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-1.5">
                {msg.role === 'user' ? (
                  <User size={10} className="text-[#DFFF00]/70" />
                ) : (
                  <MessageSquare size={10} className="text-white/40" />
                )}
                <span className="text-[9px] font-headline tracking-wider uppercase text-white/40">
                  {msg.role}
                </span>
                {msg.model && (
                  <span className="text-[9px] font-mono text-white/25 truncate">
                    {msg.model}
                  </span>
                )}
              </div>
              <p
                dir="auto"
                className="text-xs text-white/65 font-body leading-relaxed whitespace-pre-wrap pl-4"
              >
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChatList({ chats, emptyLabel }: { chats: ChatSessionWithMessages[]; emptyLabel: string }) {
  if (chats.length === 0) {
    return <p className="text-xs text-white/30 font-body py-4 text-center">{emptyLabel}</p>
  }
  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      {chats.map((session) => (
        <SessionRow key={session.id} session={session} />
      ))}
    </div>
  )
}

export function ChatHistory({ publicChats, adminChats }: ChatHistoryProps) {
  const [activeTab, setActiveTab] = useState<'public' | 'admin'>('public')

  const tabBase =
    'px-4 py-2 font-headline text-[10px] tracking-[0.25em] transition-colors'
  const tabActive = 'text-[#DFFF00] border-b-2 border-[#DFFF00]'
  const tabInactive = 'text-white/40 border-b-2 border-transparent hover:text-white/70'

  return (
    <div>
      <div className="flex gap-1 border-b border-white/10 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('public')}
          className={`${tabBase} ${activeTab === 'public' ? tabActive : tabInactive}`}
        >
          PUBLIC ({publicChats.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`${tabBase} ${activeTab === 'admin' ? tabActive : tabInactive}`}
        >
          ADMIN ({adminChats.length})
        </button>
      </div>

      {activeTab === 'public' ? (
        <ChatList chats={publicChats} emptyLabel="No public visitor chats yet." />
      ) : (
        <ChatList chats={adminChats} emptyLabel="No admin chats yet." />
      )}
    </div>
  )
}
