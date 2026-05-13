"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export function ProjectCardLink({ href, children, className }: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    router.push(href)
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.3, 1] }}
              className="font-mono text-[#ADFF2F] text-lg"
            >
              <span className="inline-block animate-pulse">_</span>
              <span> loading project...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
    </>
  )
}
