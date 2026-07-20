"use client"

import { motion } from "framer-motion"

interface TechSpec {
  key: string
  value: string
  isHighlighted?: boolean
}

interface TechSpecsGridProps {
  specs: TechSpec[]
}

/** Split "A / B / C" or "A, B" tool strings into clean tags. */
function parseToolTags(value: string): string[] {
  return value
    .split(/[/|,·•]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function isToolsSpec(spec: TechSpec): boolean {
  return spec.key.trim().toUpperCase() === "TOOLS"
}

export function TechSpecsGrid({ specs }: TechSpecsGridProps) {
  const toolsSpec = specs.find(isToolsSpec)
  const metaSpecs = specs.filter((spec) => !isToolsSpec(spec))
  const toolTags = toolsSpec ? parseToolTags(toolsSpec.value) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="rounded-xl border border-white/10 bg-black/40 overflow-hidden"
    >
      {/* Meta row — equal cells, content-height (no tall empty stretch) */}
      <div
        className={`
          grid grid-cols-2
          ${metaSpecs.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-2"}
          divide-x divide-y divide-white/10
        `}
      >
        {metaSpecs.map((spec, index) => (
          <motion.div
            key={spec.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
            className={`
              relative flex flex-col gap-2 p-4 sm:p-5
              ${spec.isHighlighted ? "bg-[#DFFF00]/[0.04]" : "bg-transparent"}
            `}
          >
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-white/40">
              {spec.key}
            </span>
            <span
              className={`
                text-sm sm:text-base font-mono leading-snug break-words
                ${spec.isHighlighted ? "text-[#DFFF00]" : "text-white/90"}
              `}
            >
              {spec.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Tools — full-width tag strip so long stacks never break the grid */}
      {toolsSpec && (
        <div className="border-t border-white/10 px-4 sm:px-5 py-4 sm:py-5 space-y-3 bg-white/[0.02]">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-white/40 block">
            {toolsSpec.key}
          </span>
          {toolTags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {toolTags.map((tag) => (
                <li
                  key={tag}
                  className="
                    inline-flex items-center
                    px-2.5 py-1
                    rounded-md
                    border border-white/10
                    bg-white/[0.04]
                    text-[11px] sm:text-xs font-mono tracking-wide
                    text-white/80
                    uppercase
                  "
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm font-mono text-white/50">N/A</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
