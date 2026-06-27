import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { HermesChatWidget } from '@/components/hermes/HermesChatWidget'
import { getHermesConfig, isHermesConfigured } from '@/agents/hermes/config'
import { isHermesRemoteConfigured } from '@/lib/security/hermes-remote'
import { isTelegramConfigured } from '@/lib/integrations/telegram'
import { TestTelegramButton } from '@/components/hermes/TestTelegramButton'

export const dynamic = 'force-dynamic'

export default async function HermesDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/dashboard')

  const config = getHermesConfig()
  const hermesApiReady = isHermesConfigured(config)
  const remoteReady = isHermesRemoteConfigured()
  const telegramReady = isTelegramConfigured()

  return (
    <main className="min-h-screen bg-[#030305] px-4 py-10 text-white md:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-headline text-[10px] tracking-[0.4em] text-[#DFFF00]">HERMES</p>
          <h1 className="mt-2 font-headline text-xl tracking-[0.3em]">AGENT CONSOLE</h1>
          <p className="mt-2 max-w-2xl text-xs text-white/45">
            Local chat assistant + remote Hermes Agent integration for dashboard planning,
            Telegram alerts, and server-side admin tools.
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
          title="Hermes"
          subtitle="Dashboard agent"
          floating={false}
          defaultOpen
        />

        <aside className="space-y-4">
          <section className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="font-headline text-xs tracking-[0.28em] text-[#DFFF00]">LOCAL ASSISTANT</h2>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <div className="flex items-center justify-between gap-3">
                <span>API endpoint</span>
                <span className={hermesApiReady ? 'text-[#DFFF00]' : 'text-red-300'}>
                  {hermesApiReady ? 'READY' : 'MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Model</span>
                <span className="max-w-[180px] truncate text-white/85">{config.model}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="font-headline text-xs tracking-[0.28em] text-[#DFFF00]">REMOTE AGENT</h2>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <div className="flex items-center justify-between gap-3">
                <span>Remote secret</span>
                <span className={remoteReady ? 'text-[#DFFF00]' : 'text-red-300'}>
                  {remoteReady ? 'SET' : 'MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Telegram alerts</span>
                <span className={telegramReady ? 'text-[#DFFF00]' : 'text-red-300'}>
                  {telegramReady ? 'READY' : 'MISSING'}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <TestTelegramButton />
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="font-headline text-xs tracking-[0.28em] text-[#DFFF00]">ENVIRONMENT</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Add these values to connect the remote Hermes Agent and Telegram bot:
            </p>
            <pre className="mt-3 overflow-x-auto rounded border border-white/10 bg-black/40 p-3 text-[11px] text-white/70">
{`HERMES_API_BASE_URL=...
HERMES_API_KEY=...
HERMES_MODEL=...
HERMES_REMOTE_SECRET=...
HERMES_REBUILD_HOOK=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...`}
            </pre>
          </section>
        </aside>
      </div>
    </main>
  )
}
