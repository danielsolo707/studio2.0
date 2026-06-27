"use client"

import { useState, useActionState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Project } from '@/types/project'
import {
  updateProjectAction,
  deleteProjectAction,
  deleteMediaAction,
  reorderMediaAction,
} from '@/app/dashboard/actions'
import { MediaPreview } from './MediaPreview'
import { MultiUploadField } from './MultiUploadField'
import { ProjectLinks } from './ProjectLinks'
import { ProjectMediaFields } from '@/components/project/MediaFieldsEditable'
import { RichTextEditor } from '@/components/content/RichTextEditor'
import {
  getProjectDiscipline,
  getProjectLinks,
  getProjectStatus,
  LINK_TYPE_LABELS,
  LINK_TYPE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '@/lib/cms/project-meta'

type UpdateState = { error?: string; success?: boolean }
const initialUpdateState: UpdateState = {}

function ProjectCard({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [description, setDescription] = useState(project.description || '')
  const [state, formAction] = useActionState(updateProjectAction, initialUpdateState)

  return (
    <div className="border border-white/10 bg-black/30 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-[10px] px-2 py-1 rounded ${
            getProjectDiscipline(project) === 'motion' 
              ? 'bg-[#DFFF00]/20 text-[#DFFF00]' 
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {getProjectDiscipline(project) === 'motion' ? 'MOTION' : 'CODE'}
          </span>
          <span className="text-white font-headline text-sm">{project.name}</span>
          <span className="text-white/40 text-xs">{project.year}</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-white/50" />
        ) : (
          <ChevronDown size={18} className="text-white/50" />
        )}
      </button>

      {isExpanded && (
        <div className="p-6 pt-0 border-t border-white/10">
          <form action={formAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="originalId" value={project.id} />
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
            <input type="hidden" name="discipline" value={getProjectDiscipline(project)} />
            <div>
              <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">STATUS</p>
              <input
                name="status"
                defaultValue={getProjectStatus(project)}
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
            <ProjectMediaFields 
              projectId={project.id}
              initialImageUrl={project.imageUrl}
              initialVideoUrl={project.videoUrl || ''}
              initialMedia={project.media}
            />
            <div className="md:col-span-2">
              <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">DESCRIPTION</p>
              <RichTextEditor
                name="description"
                value={description}
                onChange={setDescription}
                placeholder="Enter a brief description of the project... Use **bold**, *italic*, - for lists, [text](url) for links."
                rows={5}
              />
            </div>
            {getProjectDiscipline(project) === 'code' && (
              <>
                <div className="md:col-span-2">
                  <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">CHALLENGE (CODE STYLE)</p>
                  <textarea 
                    name="challenge"
                    defaultValue={project.challenge || ''}
                    placeholder="// Describe the main challenge...&#10;const challenge = 'building real-time sync';"
                    className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none font-mono text-sm"
                    rows={4}
                  />
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SOLUTION (CODE STYLE)</p>
                  <textarea 
                    name="solution"
                    defaultValue={project.solution || ''}
                    placeholder="// Describe the solution...&#10;const solution = 'using WebSocket connections';"
                    className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none font-mono text-sm"
                    rows={4}
                  />
                </div>
              </>
            )}
            <div className="md:col-span-2 grid gap-3 border border-white/10 p-3">
              <p className="font-headline text-[10px] tracking-[0.3em] text-white/50">
                PROJECT LINKS
              </p>
              <ProjectLinks 
                defaultType={getProjectLinks(project)[0]?.type || 'demo'}
                existingLinks={getProjectLinks(project)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#DFFF00] text-black text-xs tracking-widest hover:bg-[#d4ff00] transition-colors"
            >
              UPDATE
            </button>
            {state?.success && (
              <p className="text-xs text-[#DFFF00] md:col-span-2">Project updated.</p>
            )}
            {state?.error && (
              <p className="text-xs text-red-400 md:col-span-2">{state.error}</p>
            )}
          </form>

          <div className="flex flex-wrap items-start gap-6 mt-4">
            <MultiUploadField projectId={project.id} />

            <form action={deleteProjectAction}>
              <input type="hidden" name="id" value={project.id} />
              <button
                type="submit"
                onClick={(e) => {
                  if (!confirm('Delete this project? This cannot be undone.')) {
                    e.preventDefault();
                  }
                }}
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
                          onClick={(e) => {
                            if (!confirm('Remove this media item?')) {
                              e.preventDefault();
                            }
                          }}
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
      )}
    </div>
  )
}

function DisciplineSection({ 
  title, 
  projects, 
  color,
  defaultOpen = false 
}: { 
  title: string
  projects: Project[]
  color: string
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (projects.length === 0) return null

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-black/40 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span 
            className="text-[10px] px-2 py-1 rounded font-headline tracking-[0.2em]"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {title}
          </span>
          <span className="text-white/60 text-xs">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-white/50" />
        ) : (
          <ChevronDown size={18} className="text-white/50" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-4 p-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const motionProjects = projects.filter(p => getProjectDiscipline(p) === 'motion')
  const codeProjects = projects.filter(p => getProjectDiscipline(p) === 'code')
  const otherProjects = projects.filter(p => {
    const d = getProjectDiscipline(p)
    return d !== 'motion' && d !== 'code'
  })

  return (
    <div className="space-y-4">
      <DisciplineSection 
        title="MOTION" 
        projects={motionProjects} 
        color="#DFFF00"
        defaultOpen={motionProjects.length > 0}
      />
      <DisciplineSection 
        title="CODE" 
        projects={codeProjects} 
        color="#3B82F6"
        defaultOpen={codeProjects.length > 0}
      />
      {otherProjects.length > 0 && (
        <DisciplineSection 
          title="OTHER" 
          projects={otherProjects} 
          color="#8B5CF6"
        />
      )}
    </div>
  )
}