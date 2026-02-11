import { readContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { is2FAEnabled } from '@/lib/totp';
import { listMessages } from '@/lib/contact-log';
import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { MultiUploadField } from './MultiUploadField';
import { TwoFactorSetup } from './TwoFactorSetup';
import {
  addProjectAction,
  deleteProjectAction,
  loginAction,
  logoutAction,
  updateAboutAction,
  updateProjectAction,
  deleteMediaAction,
  reorderMediaAction,
} from './actions';
import { StatusBadge } from './StatusBadge';
import { MediaPreview } from './MediaPreview';

export default async function DashboardPage() {
  const session = await getSession();

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

  const content = await readContent();
  const twoFAEnabled = await is2FAEnabled();
  const messages = (await listMessages()).map((m) => ({
    ...m,
    isRead: m.isRead ?? false,
    archived: m.archived ?? false,
  }));
  const unreadCount = messages.filter((m) => !m.isRead && !m.archived).length;

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
          <button className="px-4 py-2 border border-white/20 text-xs tracking-widest w-full">
            SIGN OUT
          </button>
        </form>
      </header>

      <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="space-y-8">
          <section className="border border-white/10 p-6 bg-black/30 rounded-lg">
          <h2 className="font-headline text-sm tracking-[0.4em] text-[#DFFF00] mb-4">
            ABOUT SECTION
          </h2>
          <form action={updateAboutAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">LABEL</label>
              <input
                name="label"
                defaultValue={content.about.label}
                className="w-full bg-transparent border border-white/10 px-4 py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">HEADLINE</label>
              <input
                name="headline"
                defaultValue={content.about.headline}
                className="w-full bg-transparent border border-white/10 px-4 py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">BODY</label>
              <textarea
                name="body"
                defaultValue={content.about.body}
                rows={5}
                className="w-full bg-transparent border border-white/10 px-4 py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">SKILLS (comma separated)</label>
              <input
                name="skills"
                defaultValue={content.about.skills.join(', ')}
                className="w-full bg-transparent border border-white/10 px-4 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em]"
            >
              UPDATE ABOUT
            </button>
          </form>
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
                className="px-4 py-2 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#d4ff00]"
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
                  <input name="id" defaultValue={project.id} className="bg-transparent border border-white/10 px-3 py-2" />
                  <input name="name" defaultValue={project.name} className="bg-transparent border border-white/10 px-3 py-2" />
                  <input name="year" defaultValue={project.year} className="bg-transparent border border-white/10 px-3 py-2" />
                  <input name="category" defaultValue={project.category} className="bg-transparent border border-white/10 px-3 py-2" />
                  <input name="tools" defaultValue={project.tools} className="bg-transparent border border-white/10 px-3 py-2" />
                  <input name="color" defaultValue={project.color} className="bg-transparent border border-white/10 px-3 py-2" />
                  <input name="imageUrl" defaultValue={project.imageUrl} className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2" />
                  <input name="videoUrl" defaultValue={project.videoUrl || ''} className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2" />
                  <textarea
                    name="description"
                    defaultValue={project.description}
                    rows={3}
                    className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#DFFF00] text-black text-xs tracking-widest"
                  >
                    UPDATE
                  </button>
                </form>

                <div className="flex flex-wrap items-start gap-6 mt-4">
                  <MultiUploadField projectId={project.id} />

                  <form action={deleteProjectAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <button className="px-3 py-2 border border-red-500/50 text-red-300 text-xs tracking-widest">
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
                                className="px-2 py-1 border border-white/20 text-[11px] text-white/80 disabled:opacity-30"
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
                                className="px-2 py-1 border border-white/20 text-[11px] text-white/80 disabled:opacity-30"
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
                              <button className="text-xs text-red-300 border border-red-500/40 px-2 py-1">
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
            <form action={addProjectAction} className="grid gap-3 md:grid-cols-2">
              <input name="id" placeholder="slug (e.g. my-project)" className="bg-transparent border border-white/10 px-3 py-2" />
              <input name="name" placeholder="name" className="bg-transparent border border-white/10 px-3 py-2" />
              <input name="year" placeholder="year" className="bg-transparent border border-white/10 px-3 py-2" />
              <input name="category" placeholder="category" className="bg-transparent border border-white/10 px-3 py-2" />
              <input name="tools" placeholder="tools" className="bg-transparent border border-white/10 px-3 py-2" />
              <input name="color" placeholder="#DFFF00" className="bg-transparent border border-white/10 px-3 py-2" />
              <input name="imageUrl" placeholder="image URL" className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2" />
              <input name="videoUrl" placeholder="video URL (optional)" className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2" />
              <textarea name="description" placeholder="description" rows={3} className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2" />
              <button type="submit" className="px-4 py-2 bg-[#DFFF00] text-black text-xs tracking-widest">
                ADD
              </button>
            </form>
          </div>
        </section>

      </div>
    </main>
  );
}
