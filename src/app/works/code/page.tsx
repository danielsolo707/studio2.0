import Link from "next/link"
import { readContent } from '@/lib/content'
import { ProjectCardLink } from '@/components/ProjectCardLink'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Creative Code | The Fluid Logic',
  description: 'Creative code portfolio - web applications, tools, and development projects.',
}

export default async function CodeWorksPage() {
  const content = await readContent()
  const codeProjects = content.projects.filter(
    (p) => p.discipline === 'code' || (!p.discipline && p.category?.toLowerCase().includes('code'))
  )

  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-[#050505]/80 backdrop-blur-sm">
        <Link 
          href="/gateway"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>cd ..</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/works/motion" className="text-xs sm:text-sm text-zinc-500 hover:text-white transition-colors">
            motion/
          </Link>
          <span className="text-xs sm:text-sm text-[#ADFF2F] border-b border-[#ADFF2F] pb-1">code/</span>
        </nav>
      </header>

      <div className="pt-24 sm:pt-32 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto pb-12">
        <span className="text-xs sm:text-sm text-[#ADFF2F]">const portfolio = {"{"}</span>
        <h1 className="mt-4 text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
          <span className="text-blue-400">discipline</span>
          <span className="text-white">: </span>
          <span className="text-emerald-400">{'"'}Creative Code{'"'}</span>
          <span className="text-white">,</span>
        </h1>
        <p className="mt-6 sm:mt-8 text-sm sm:text-base text-zinc-500 max-w-xl">
          {"//"} Web applications, creative tools, and development projects that blend technical skill with design thinking.
        </p>

        <div className="mt-16 sm:mt-24">
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-500">
            <span className="text-[#ADFF2F]">{">"}_</span>
            <span>~/projects</span>
          </div>
          <h2 className="mt-4 text-xl sm:text-2xl">
            <span className="text-blue-400">const</span>{" "}
            <span className="text-emerald-400">projects</span>{" "}
            <span className="text-white">= [</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500">
            {codeProjects.length} repositories found
          </p>

          <div className="mt-8 h-px bg-zinc-800" />

          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            {codeProjects.map((project, index) => (
              <div
                key={index}
                className="block p-4 sm:p-6 border border-zinc-800 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-[#ADFF2F]/30 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <ProjectCardLink
                        href={`/projects/${project.id}`}
                        className="text-sm sm:text-lg font-medium tracking-wide hover:text-[#ADFF2F] transition-colors"
                      >
                        {project.name}
                      </ProjectCardLink>
                      <span className="px-2 py-0.5 text-xs border border-zinc-700 rounded text-zinc-400">
                        {project.status === 'case-study' ? 'Case Study' : project.status || 'Prototype'}
                      </span>
                    </div>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                      {project.description}
                    </p>
                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[#ADFF2F]">●</span>
                      <span className="text-[#ADFF2F]">Creative Code</span>
                      <span className="text-zinc-600 hidden sm:inline">{project.role || 'Developer'}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-600">{project.year}</span>
                      <span className="text-zinc-600 hidden sm:inline">•</span>
                      <span className="text-zinc-500 hidden sm:inline">{project.tools}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 sm:hidden">
                      {project.tools?.split(' / ').slice(0, 3).map((t: string) => (
                        <span key={t} className="text-xs text-zinc-500 px-1.5 py-0.5 bg-zinc-800/50 rounded">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {project.links?.filter(l => ['demo', 'github', 'kaggle'].includes(l.type)).map(link => (
                      <a
                        key={link.type}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 border border-zinc-800 rounded hover:border-zinc-600 transition-colors"
                      >
                        {link.type === 'github' ? (
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                          </svg>
                        ) : link.type === 'demo' ? (
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                            <path d="M18 17V9" />
                            <path d="M13 17V5" />
                            <path d="M8 17v-3" />
                          </svg>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 h-px bg-zinc-800" />
          <p className="mt-6 text-sm text-zinc-500">
            {"}"}{/* {codeProjects.length} projects */}
          </p>
        </div>
      </div>
    </main>
  )
}