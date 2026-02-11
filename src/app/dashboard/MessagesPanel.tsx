"use client";

import { useMemo, useState, useTransition, useActionState } from 'react';
import {
  markReadAction,
  toggleArchiveAction,
  deleteMessageAction,
  bulkDeleteAction,
  replyMessageAction,
} from './actions';
import type { StoredMessage } from '@/lib/contact-log';

interface Props {
  messages: StoredMessage[];
  serviceStatus: { resend: boolean; db: boolean };
}

const truncate = (text: string, n = 50) => (text.length > n ? `${text.slice(0, n)}…` : text);
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(iso));

export function MessagesPanel({ messages, serviceStatus }: Props) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replyTarget, setReplyTarget] = useState<StoredMessage | null>(null);
  const [replyState, replyDispatch] = useActionState(replyMessageAction, {} as { error?: string });
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages.filter((m) => !m.archived);
    return messages.filter(
      (m) => !m.archived && (m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    );
  }, [messages, query]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkDelete = () => {
    if (selected.size === 0) return;
    startTransition(() => {
      const form = new FormData();
      form.set('ids', Array.from(selected).join(','));
      bulkDeleteAction({}, form);
      setSelected(new Set());
    });
  };

  return (
    <section className="border border-white/10 p-6 bg-black/30 rounded-lg space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00]">MESSAGES</h2>
          <p className="text-xs text-white/40 font-body">CRM-style inbox</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-headline tracking-[0.3em]">
          <StatusPill label="Resend" ok={serviceStatus.resend} />
          <StatusPill label="DB" ok={serviceStatus.db} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="flex-1 min-w-[240px] bg-transparent border border-white/15 px-3 py-2 text-sm text-white focus:border-[#DFFF00]/60 focus:outline-none"
        />
        <button
          onClick={bulkDelete}
          disabled={selected.size === 0 || isPending}
          className="px-4 py-2 text-xs font-headline tracking-[0.3em] border border-red-500/50 text-red-300 disabled:opacity-40"
        >
          BULK DELETE ({selected.size})
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map((m) => {
          const isOpen = openId === m.id;
          const isSelected = selected.has(m.id);
          return (
            <div
              key={m.id}
              className={`rounded border border-white/10 bg-black/40 transition-shadow ${
                m.isRead ? '' : 'shadow-[0_0_20px_rgba(223,255,0,0.25)] border-[#DFFF00]/30'
              }`}
            >
              <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setOpenId(isOpen ? null : m.id)}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(m.id)}
                  className="accent-[#DFFF00] w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`font-headline text-xs tracking-[0.3em] ${m.isRead ? 'text-white/60' : 'text-[#DFFF00]'}`}>
                      {m.name}
                    </span>
                    <span className="font-mono text-xs text-white/50 truncate">{m.email}</span>
                    {!m.isRead && <span className="w-2 h-2 rounded-full bg-[#DFFF00] shadow-[0_0_8px_rgba(223,255,0,0.8)]" />}
                  </div>
                  <p className="text-sm text-white/80 truncate">{truncate(m.message)}</p>
                  <p className="text-[11px] text-white/40">{formatDate(m.receivedAt)}</p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {!m.isRead && (
                    <form action={markReadAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button className="text-[11px] px-2 py-1 border border-white/20 text-white/70 hover:text-[#DFFF00]">
                        Mark read
                      </button>
                    </form>
                  )}
                  <form action={toggleArchiveAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="archive" value={(!m.archived).toString()} />
                    <button className="text-[11px] px-2 py-1 border border-white/20 text-white/70 hover:text-[#DFFF00]">
                      {m.archived ? 'Unarchive' : 'Archive'}
                    </button>
                  </form>
                  <button
                    className="text-[11px] px-2 py-1 border border-white/20 text-white/70 hover:text-[#DFFF00]"
                    onClick={(e) => { e.stopPropagation(); setReplyTarget(m); }}
                  >
                    Reply
                  </button>
                  <form action={deleteMessageAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="text-[11px] px-2 py-1 border border-red-500/40 text-red-300 hover:text-red-200">
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 text-white/80 text-sm leading-relaxed">
                  {m.message}
                  {m.replies && m.replies.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                      <p className="text-[10px] tracking-[0.35em] text-[#DFFF00] font-headline">REPLIES</p>
                      {m.replies
                        .slice()
                        .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1))
                        .map((r) => (
                          <div key={r.id} className="border border-white/10 rounded px-3 py-2 text-sm text-white/80">
                            <div className="flex items-center justify-between text-[11px] text-white/50">
                              <span>{formatDate(r.sentAt)}</span>
                              <span className="font-mono text-white/60">{r.subject}</span>
                            </div>
                            <div className="text-white/70 whitespace-pre-wrap mt-1">{r.body}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-white/50 text-sm">No messages found.</p>
        )}
      </div>

      {replyTarget && (
        <ReplyModal
          message={replyTarget}
          onClose={() => setReplyTarget(null)}
          action={(form) => replyDispatch(form)}
          pending={isPending}
          startTransition={startTransition}
          error={replyState?.error}
        />
      )}
    </section>
  );
}

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`px-3 py-1 rounded-full border text-[10px] ${
        ok ? 'border-[#DFFF00]/60 text-[#DFFF00]' : 'border-red-500/50 text-red-300'
      }`}
    >
      {label}: {ok ? 'OK' : 'DOWN'}
    </span>
  );
}

function ReplyModal({
  message,
  onClose,
  action,
  pending,
  startTransition,
  error,
}: {
  message: StoredMessage;
  onClose: () => void;
  action: (formData: FormData) => void;
  pending: boolean;
  startTransition: React.TransitionStartFunction;
  error?: string;
}) {
  const [subject, setSubject] = useState(`Re: Your message`);
  const [body, setBody] = useState(`Hi ${message.name},\n\n`);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(() => action(form));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg border border-white/10 bg-[#0b0b0f] p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-headline text-xs tracking-[0.3em] text-[#DFFF00]">REPLY</p>
            <p className="text-sm text-white/70">to {message.email}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={message.id} />
          <input type="hidden" name="to" value={message.email} />
          <label className="block text-xs text-white/60">Subject</label>
          <input
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-transparent border border-white/15 px-3 py-2 text-sm text-white"
            required
          />

          <label className="block text-xs text-white/60">Message</label>
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full bg-transparent border border-white/15 px-3 py-2 text-sm text-white"
            required
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-white/60 text-sm">Cancel</button>
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em]"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
