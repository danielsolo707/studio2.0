"use client"

import { motion } from "framer-motion"
import { Folder } from "lucide-react"

interface JSDocOverviewProps {
  projectName: string
  description: string
  status: string
}

export function JSDocOverview({ projectName, description, status }: JSDocOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-muted/30 border border-border rounded-lg p-4 md:p-6 font-mono overflow-x-auto"
    >
      <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
        <Folder className="w-4 h-4" />
        <span>PROJECT OVERVIEW</span>
      </div>

      <div className="text-xs sm:text-sm leading-relaxed">
        <div className="text-muted-foreground">
          <span className="text-[#6A9955]">{" /**"}</span>
        </div>
        
        <div className="pl-1 space-y-2 sm:space-y-1">
          <div className="flex flex-wrap">
            <span className="text-[#6A9955]">{" * "}</span>
            <span className="text-[#569CD6]">@project</span>
            <span className="text-foreground ml-1">{projectName}</span>
          </div>
          
          <div className="flex flex-wrap">
            <span className="text-[#6A9955] shrink-0">{" * "}</span>
            <span className="text-[#569CD6] shrink-0">@description</span>
            <span className="text-foreground ml-1 break-words">{description}</span>
          </div>
          
          <div className="flex flex-wrap">
            <span className="text-[#6A9955]">{" * "}</span>
            <span className="text-[#569CD6]">@status</span>
            <span className="text-lime ml-1">{status}</span>
          </div>
        </div>
        
        <div className="text-muted-foreground">
          <span className="text-[#6A9955]">{" */"}</span>
        </div>
      </div>
    </motion.div>
  )
}