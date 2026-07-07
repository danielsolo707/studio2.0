import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { HermesChatWidget } from '@/components/hermes/HermesChatWidget'
import { AiConfigForm } from '@/components/ai/AiConfigForm'
import { ChatHistory } from '@/components/ai/ChatHistory'
import { readAiSettings } from '@/lib/ai/ai-settings'
import { getChatHistory } from '@/lib/ai/ai-chat-db'

export const dynamic = 'force-dynamic'

export default async function AssistantDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/dashboard')

  const aiSettings = await readAiSettings()
  const hasApiKey = Boolean(aiSettings.apiKey)

  // Fetch chat history for both modes
  const [publicChats, adminChats] = await Promise.all([
    getChatHistory('public', 50),
    getChatHistory('admin', 50),
  ])

  return (
    <main className="min-h-screen bg-[#030305] px-4 py-10 text-white md:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-headline text-[10px] tracking-[0.4em] text-[#DFFF00]">ASSISTANT</p>
          <h1 className="mt-2 font-headline text-xl tracking-[0.3em]">CONSOLE</h1>
          <p className="mt-2 max-w-2xl text-xs text-white/45">
            AI chat assistant for dashboard planning, drafting replies, and managing projects.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded border border-white/20 px-4 py-2 font-headline text-xs tracking-[0.24em] text-white/70 transition-colors hover:border-[#DFFF00]/50 hover:text-[#DFFF00]"
        >
          BACK TO DASHBOARD
        </Link>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        {/* ─── Left: chat widget ─── */}
        <div className="space-y-6">
          <HermesChatWidget
            mode="admin"
            title="Assistant"
            subtitle="Dashboard assistant"
            floating={false}
            defaultOpen
          />

          {/* ─── Chat history (tabs) ─── */}
          <section className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="font-headline text-xs tracking-[0.28em] text-[#DFFF00] mb-4">
              CHAT HISTORY
            </h2>
            <ChatHistory publicChats={publicChats} adminChats={adminChats} />
          </section>
        </div>

        {/* ─── Right: config + status ─── */}
        <aside className="space-y-4">
          {/* ─── AI configuration form ─── */}
          <section className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="font-headline text-xs tracking-[0.28em] text-[#DFFF00] mb-4">
              AI CONFIGURATION
            </h2>
            <AiConfigForm
              initialPublicModel={aiSettings.publicModel}
              initialAdminModel={aiSettings.adminModel}
              hasApiKey={hasApiKey}
            />
          </section>

          {/* ─── Status ─── */}
          <section className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="font-headline text-xs tracking-[0.28em] text-[#DFFF00]">STATUS</h2>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <div className="flex items-center justify-between gap-3">
                <span>Provider</span>
                <span className="text-white/85">Gemini (Google)</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>API key</span>
                <span className={hasApiKey ? 'text-[#DFFF00]' : 'text-red-300'}>
                  {hasApiKey ? 'SET' : 'MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Public model</span>
                <span className="max-w-[200px] truncate text-white/85" title={aiSettings.publicModel}>
                  {aiSettings.publicModel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Admin model</span>
                <span className="max-w-[200px] truncate text-white/85" title={aiSettings.adminModel}>
                  {aiSettings.adminModel}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}
