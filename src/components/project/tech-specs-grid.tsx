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

export function TechSpecsGrid({ specs }: TechSpecsGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px border border-border rounded-lg overflow-hidden"
    >
      {specs.map((spec, index) => (
        <motion.div
          key={spec.key}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 * index }}
          className={`
            bg-muted/30 p-4 relative
            ${spec.isHighlighted ? 'ring-1 ring-lime/30' : ''}
          `}
        >
          {spec.isHighlighted && (
            <div className="absolute inset-0 bg-lime/5 pointer-events-none" />
          )}
          
          <div className="relative">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">
              {spec.key}
            </span>
            <span className={`text-sm font-mono ${spec.isHighlighted ? 'text-lime' : 'text-foreground'}`}>
              {spec.value}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}