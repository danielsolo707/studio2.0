"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, GitBranch, FileCode2 } from "lucide-react"

interface IDEHeaderProps {
  projectSlug: string
  projectName: string
}

export function IDEHeader({ projectSlug, projectName }: IDEHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="flex items-center justify-between px-3 md:px-6 py-3">
        <Link 
          href="/works/code"
          className="flex items-center gap-2 text-muted-foreground hover:text-lime transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-sm">cd ..</span>
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/50 rounded-t-md border-b-2 border-lime">
            <FileCode2 className="w-4 h-4 text-lime" />
            <span className="font-mono text-sm text-foreground truncate max-w-[150px] md:max-w-none">{projectSlug}.tsx</span>
          </div>
        </div>

        <div className="hidden sm:block w-20" />
      </div>

      <div className="px-3 md:px-6 py-2 bg-muted/30 border-t border-border/50">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground overflow-x-auto">
          <span className="text-lime shrink-0">{">"}_</span>
          <span className="truncate">~/projects/{projectSlug}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 md:px-6 py-1.5 bg-[#0d0d0d] border-t border-border/30 text-xs font-mono">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GitBranch className="w-3 h-3" />
            <span>main</span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">UTF-8</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-lime hidden sm:inline">Prettier: Ready</span>
          <span className="text-muted-foreground">TypeScript</span>
        </div>
      </div>
    </motion.header>
  )
}