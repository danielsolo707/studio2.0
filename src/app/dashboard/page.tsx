import { readContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { is2FAEnabled } from '@/lib/totp';
import { isCaptchaEnabled } from '@/lib/captcha-config';
import { listMessages } from '@/lib/contact-log';
import { isDriveConfigured } from '@/lib/google-drive';
import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { MultiUploadField } from './MultiUploadField';
import { TwoFactorSetup } from './TwoFactorSetup';
import { CaptchaToggle } from './CaptchaToggle';
import {
  loginAction,
  logoutAction,
} from './actions';
import { StatusBadge } from './StatusBadge';
import { AboutForm } from './AboutForm';
import AddProjectSection from './AddProjectSection';
import { ProjectOptions } from './ProjectOptions';
import { HeroForm } from './HeroForm';
import { ProjectList } from './ProjectList';
import {
  getProjectRole,
} from '@/lib/project-meta';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let session;
  let content;
  let twoFAEnabled = false;
  let captchaEnabled = false;
  let messages: any[] = [];
  let unreadCount = 0;

  try {
    session = await getSession();
    
    if (session) {
      // Fetch content and messages only if authenticated
      content = await readContent();
      twoFAEnabled = await is2FAEnabled();
      captchaEnabled = await isCaptchaEnabled();
      
      const rawMessages = await listMessages();
      messages = rawMessages.map((m) => ({
        ...m,
        isRead: m.isRead ?? false,
        archived: m.archived ?? false,
      }));
      unreadCount = messages.filter((m) => !m.isRead && !m.archived).length;
    }
  } catch (error) {
    console.error('Dashboard data loading error:', error);
    // Render login page if there are issues
    session = null;
  }

  if (!session) {
    captchaEnabled = await isCaptchaEnabled();
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center px-6">
        <div className="w-full max-w-md border border-white/10 p-8 bg-black/40 backdrop-blur-sm">
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.4em] text-[#DFFF00] font-headline">
              THE FLUID LOGIC
            </p>
            <h1 className="font-headline text-xl text-white tracking-[0.3em] mt-2">
              ADMIN LOGIN
            </h1>
            <p className="text-xs text-white/40 mt-2 font-body">
              Enter your credentials to manage About and Selected Works.
            </p>
          </div>
          <LoginForm captchaEnabled={captchaEnabled} />
        </div>
      </main>
    );
  }

  // Ensure content is loaded before rendering
  if (!content) {
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white px-4 md:px-10 py-8 md:py-10">
      <header className="flex items-center justify-between gap-4 mb-10 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-[#DFFF00] font-headline">
            THE FLUID LOGIC
          </p>
          <h1 className="font-headline text-xl tracking-[0.3em] mt-2">DASHBOARD</h1>
          <p className="text-xs text-white/40 mt-2 font-body">
            Update About and manage Selected Works.
          </p>
        </div>
        <form action={logoutAction} className="shrink-0">
          <button 
            type="submit"
            className="px-4 py-2 border border-white/20 text-xs tracking-widest w-full hover:bg-white/10 transition-colors"
          >
            SIGN OUT
          </button>
        </form>
      </header>

      <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="space-y-8">
          <section className="border border-white/10 p-6 bg-black/30 rounded-lg">
            <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00] mb-4">
              HERO SECTION
            </h2>
            <HeroForm initialData={content.hero || { headline: 'CREATIVE\nDEVELOPER', description: '' }} />
          </section>

          <section className="border border-white/10 p-6 bg-black/30 rounded-lg">
            <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00] mb-4">
              ABOUT SECTION
            </h2>
            <AboutForm initialData={content.about} />
          </section>

          <TwoFactorSetup initialEnabled={twoFAEnabled} />
          <CaptchaToggle initialEnabled={captchaEnabled} />

          <section className="border border-white/10 p-6 bg-black/30 rounded-lg space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00]">GOOGLE DRIVE</h2>
                <p className="text-xs text-white/50 font-body">Import files from your Drive.</p>
              </div>
              <StatusBadge ok={isDriveConfigured()} label="DRIVE" />
            </div>
            <div id="drive-connect-container">
              <a
                href="/api/auth/google-drive/connect"
                className={`inline-flex items-center gap-2 px-4 py-2 border text-xs font-headline tracking-[0.3em] transition-colors ${
                  isDriveConfigured()
                    ? 'border-[#DFFF00] text-[#DFFF00] hover:bg-[#DFFF00] hover:text-black'
                    : 'border-white/20 text-white/40 cursor-not-allowed'
                }`}
                {...(!isDriveConfigured() ? { 'aria-disabled': true } : {})}
              >
                {isDriveConfigured() ? 'CONNECT TO GOOGLE DRIVE' : 'DRIVE NOT CONFIGURED'}
              </a>
            </div>
          </section>
          
          <section className="border border-white/10 p-6 bg-black/30 rounded-lg space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00]">CONTACT MESSAGES</h2>
                <p className="text-xs text-white/50 font-body">Keep an eye on new inquiries.</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-headline tracking-[0.3em]">
                <StatusBadge ok={Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM)} label="RESEND" />
                <StatusBadge ok={true} label="DB" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-headline text-xs tracking-[0.35em] text-[#DFFF00]">
                {unreadCount} NEW MESSAGE{unreadCount === 1 ? '' : 'S'}
              </span>
              <Link
                href="/dashboard/messages"
                className="px-4 py-2 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#d4ff00] transition-colors"
              >
                VIEW ALL MESSAGES
              </Link>
            </div>
          </section>
        </div>

<section className="min-w-0 space-y-8">
          <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00] mb-4">
            PROJECTS
          </h2>

          <ProjectList projects={content.projects} />

          <div className="mt-10 border border-white/10 p-6 bg-black/30 rounded-lg">
            <h3 className="font-headline text-xs tracking-[0.3em] mb-4">ADD PROJECT</h3>
            <AddProjectSection />
          </div>
        </section>
      </div>
    </main>
  );
}
