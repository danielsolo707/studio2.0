import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { HermesChatWidget } from '@/components/hermes/HermesChatWidget'
import { getHermesConfig, isHermesConfigured } from '@/agents/hermes/config'

export const dynamic = 'force-dynamic'

export default async function AssistantDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/dashboard')

  const config = getHermesConfig()
  const ready = isHermesConfigured(config)

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <HermesChatWidget
          mode="admin"
          title="Assistant"
          subtitle="Dashboard assistant"
          floating={false}
          defaultOpen
        />

        <aside className="space-y-4">
          <section className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="font-headline text-xs tracking-[0.28em] text-[#DFFF00]">STATUS</h2>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <div className="flex items-center justify-between gap-3">
                <span>Provider</span>
                <span className="text-white/85">OpenRouter</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>API key</span>
                <span className={ready ? 'text-[#DFFF00]' : 'text-red-300'}>
                  {ready ? 'SET' : 'MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Model</span>
                <span className="max-w-[180px] truncate text-white/85">{config.model}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="font-headline text-xs tracking-[0.28em] text-[#DFFF00]">ENVIRONMENT</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Set these in .env.local to configure the assistant:
            </p>
            <pre className="mt-3 overflow-x-auto rounded border border-white/10 bg-black/40 p-3 text-[11px] text-white/70">
{`OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-4o-mini`}
            </pre>
          </section>
        </aside>
      </div>
    </main>
  )
}
