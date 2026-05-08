import { readContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { is2FAEnabled } from '@/lib/totp';
import { listMessages } from '@/lib/contact-log';
import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { MultiUploadField } from './MultiUploadField';
import { TwoFactorSetup } from './TwoFactorSetup';
import {
  deleteProjectAction,
  loginAction,
  logoutAction,
  updateProjectAction,
  deleteMediaAction,
  reorderMediaAction,
} from './actions';
import { StatusBadge } from './StatusBadge';
import { MediaPreview } from './MediaPreview';
import { AboutForm } from './AboutForm';
import { AddProjectForm } from './AddProjectForm';
import { HeroForm } from './HeroForm';
import {
  DISCIPLINE_LABELS,
  DISCIPLINE_OPTIONS,
  getProjectDiscipline,
  getProjectLinks,
  getProjectRole,
  getProjectStatus,
  LINK_TYPE_LABELS,
  LINK_TYPE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '@/lib/project-meta';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let session;
  let content;
  let twoFAEnabled = false;
  let messages: any[] = [];
  let unreadCount = 0;

  try {
    session = await getSession();
    
    if (session) {
      // Fetch content and messages only if authenticated
      content = await readContent();
      twoFAEnabled = await is2FAEnabled();
      
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
          <LoginForm />
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

          <div className="space-y-8">
            {content.projects.map((project) => (
<div key={project.id} className="border border-white/10 p-6 bg-black/30 rounded-lg">
                <form action={updateProjectAction} className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-white/40 mb-2">BASIC INFO</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SLUG (URL)</p>
                    <input 
                      name="id" 
                      defaultValue={project.id} 
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">PROJECT NAME</p>
                    <input 
                      name="name" 
                      defaultValue={project.name} 
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">YEAR</p>
                    <input 
                      name="year" 
                      defaultValue={project.year} 
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">CATEGORY</p>
                    <input 
                      name="category" 
                      defaultValue={project.category} 
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">DISCIPLINE</p>
                    <select
                      name="discipline"
                      defaultValue={getProjectDiscipline(project)}
                      className="w-full bg-[#030305] border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                    >
                      {DISCIPLINE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{DISCIPLINE_LABELS[option]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">STATUS</p>
                    <select
                      name="status"
                      defaultValue={getProjectStatus(project)}
                      className="w-full bg-[#030305] border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>{STATUS_LABELS[option]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">ROLE</p>
                    <input
                      name="role"
                      defaultValue={getProjectRole(project)}
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">TOOLS</p>
                    <input 
                      name="tools" 
                      defaultValue={project.tools} 
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">ACCENT COLOR</p>
                    <input 
                      name="color" 
                      defaultValue={project.color} 
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">MAIN IMAGE URL</p>
                    <input 
                      name="imageUrl" 
                      defaultValue={project.imageUrl} 
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">VIDEO URL (OPTIONAL)</p>
                    <input 
                      name="videoUrl" 
                      defaultValue={project.videoUrl || ''} 
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
                    />
                  </div>
<div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SHORT DESCRIPTION</p>
                    <textarea
                      name="description"
                      defaultValue={project.description}
                      rows={3}
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                    />
                  </div>
<div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">OBJECTIVE</p>
                    <textarea
                      name="objective"
                      defaultValue={project.objective || ''}
                      placeholder="What is the goal or problem?"
                      rows={2}
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">APPROACH</p>
                    <textarea
                      name="approach"
                      defaultValue={project.approach || ''}
                      placeholder="How did you build it?"
                      rows={2}
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">OUTCOME</p>
                    <textarea
                      name="outcome"
                      defaultValue={project.outcome || ''}
                      placeholder="What was the result?"
                      rows={2}
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">NEXT STEP</p>
                    <textarea
                      name="nextStep"
                      defaultValue={project.nextStep || ''}
                      placeholder="What would you improve?"
                      rows={2}
                      className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 grid gap-3 border border-white/10 p-3">
                    <p className="font-headline text-[10px] tracking-[0.3em] text-white/50">
                      PROJECT LINKS
                    </p>
                    {[0, 1, 2].map((linkIndex) => {
                      const link = getProjectLinks(project)[linkIndex];
                      return (
                        <div key={linkIndex} className="grid gap-3 md:grid-cols-[1fr_1fr_160px]">
                          <input
                            name={`linkLabel${linkIndex}`}
                            defaultValue={link?.label || ''}
                            placeholder="label"
                            className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                          />
                          <input
                            name={`linkUrl${linkIndex}`}
                            defaultValue={link?.url || ''}
                            placeholder="https://"
                            className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                          />
                          <select
                            name={`linkType${linkIndex}`}
                            defaultValue={link?.type || 'demo'}
                            className="bg-[#030305] border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
                          >
                            {LINK_TYPE_OPTIONS.map((option) => (
                              <option key={option} value={option}>{LINK_TYPE_LABELS[option]}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#DFFF00] text-black text-xs tracking-widest hover:bg-[#d4ff00] transition-colors"
                  >
                    UPDATE
                  </button>
                </form>

                <div className="flex flex-wrap items-start gap-6 mt-4">
                  <MultiUploadField projectId={project.id} />

                  <form action={deleteProjectAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <button 
                      type="submit"
                      className="px-3 py-2 border border-red-500/50 text-red-300 text-xs tracking-widest hover:bg-red-500/10 transition-colors"
                    >
                      DELETE
                    </button>
                  </form>
                </div>

                {(() => {
                  const media = project.media && project.media.length > 0
                    ? project.media
                    : [
                        ...(project.imageUrl ? [{ type: 'image' as const, url: project.imageUrl }] : []),
                        ...(project.videoUrl ? [{ type: 'video' as const, url: project.videoUrl }] : []),
                      ];

                  if (media.length === 0) return null;

                  return (
                  <div className="mt-6">
                    <p className="text-[10px] tracking-[0.3em] text-white/50 font-headline mb-3">
                      UPLOADED MEDIA (ORDERED)
                    </p>
                    <div className="space-y-2">
                      {media.map((m, idx) => (
                        <div key={m.url} className="flex items-center gap-3 border border-white/10 px-3 py-2 rounded">
                          <span className="text-[11px] text-white/50 w-6 text-right">{idx + 1}</span>
                          <MediaPreview url={m.url} type={m.type} label={`${m.type.toUpperCase()} — ${m.url}`} />
                          <div className="flex items-center gap-2">
                            <form action={reorderMediaAction}>
                              <input type="hidden" name="id" value={project.id} />
                              <input type="hidden" name="url" value={m.url} />
                              <input type="hidden" name="direction" value="up" />
                              <button
                                type="submit"
                                className="px-2 py-1 border border-white/20 text-[11px] text-white/80 disabled:opacity-30 hover:bg-white/10 transition-colors"
                                disabled={idx === 0}
                                aria-label="Move media up"
                              >
                                ↑
                              </button>
                            </form>
                            <form action={reorderMediaAction}>
                              <input type="hidden" name="id" value={project.id} />
                              <input type="hidden" name="url" value={m.url} />
                              <input type="hidden" name="direction" value="down" />
                              <button
                                type="submit"
                                className="px-2 py-1 border border-white/20 text-[11px] text-white/80 disabled:opacity-30 hover:bg-white/10 transition-colors"
                                disabled={idx === media.length - 1}
                                aria-label="Move media down"
                              >
                                ↓
                              </button>
                            </form>
                            <form action={deleteMediaAction}>
                              <input type="hidden" name="id" value={project.id} />
                              <input type="hidden" name="url" value={m.url} />
                              {'fileId' in m && m.fileId ? (
                                <input type="hidden" name="fileId" value={(m as any).fileId} />
                              ) : null}
                              {'storage' in m && m.storage ? (
                                <input type="hidden" name="storage" value={(m as any).storage} />
                              ) : null}
                              {'thumbFileId' in m && (m as any).thumbFileId ? (
                                <input type="hidden" name="thumbFileId" value={(m as any).thumbFileId} />
                              ) : null}
                              <button 
                                type="submit"
                                className="text-xs text-red-300 border border-red-500/40 px-2 py-1 hover:bg-red-500/10 transition-colors"
                              >
                                REMOVE
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })()}
              </div>
            ))}
          </div>

          <div className="mt-10 border border-white/10 p-6 bg-black/30 rounded-lg">
            <h3 className="font-headline text-xs tracking-[0.3em] mb-4">ADD PROJECT</h3>
            <AddProjectForm />
          </div>
        </section>
      </div>
    </main>
  );
}
