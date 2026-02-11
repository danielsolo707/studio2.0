import { listMessages } from '@/lib/contact-log';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessagesPanel } from '../MessagesPanel';
import { StatusBadge } from '../StatusBadge';

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect('/dashboard');

  const messages = (await listMessages()).map((m) => ({
    ...m,
    isRead: m.isRead ?? false,
    archived: m.archived ?? false,
  }));

  const serviceStatus = {
    resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM),
    db: true,
  };

  return (
    <main className="min-h-screen bg-[#030305] text-white px-4 md:px-10 py-10 space-y-8">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-[#DFFF00] font-headline">THE FLUID LOGIC</p>
          <h1 className="font-headline text-xl tracking-[0.3em] mt-2">MESSAGES</h1>
          <p className="text-xs text-white/40 mt-2 font-body">Full CRM inbox view</p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 border border-white/20 text-xs tracking-widest font-headline"
        >
          BACK TO DASHBOARD
        </Link>
      </header>

      <div className="flex items-center gap-3 text-[10px] font-headline tracking-[0.3em]">
        <StatusBadge ok={serviceStatus.resend} label="RESEND" />
        <StatusBadge ok={serviceStatus.db} label="DB" />
        <span className="px-3 py-1 rounded-full border border-white/15 text-white/60">
          TOTAL {messages.length}
        </span>
      </div>

      <MessagesPanel messages={messages} serviceStatus={serviceStatus} />
    </main>
  );
}
