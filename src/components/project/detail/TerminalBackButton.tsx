"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function TerminalBackButton() {
  const router = useRouter()
  const [isClearing, setIsClearing] = useState(false)

  const handleClick = async () => {
    setIsClearing(true)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    router.push("/works/code")
  }

  return (
    <>
      <AnimatePresence>
        {isClearing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, times: [0, 0.3, 1] }}
              className="font-mono text-lime text-lg"
            >
              <span className="inline-block animate-pulse">_</span>
              <span> clearing terminal...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="
          group flex items-center gap-3 
          px-6 py-3 
          bg-transparent border border-border 
          rounded-lg
          hover:border-lime hover:bg-lime/5
          transition-all duration-300
          font-mono text-sm
        "
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-lime group-hover:-translate-x-1 transition-all" />
        <span className="text-muted-foreground group-hover:text-lime transition-colors">cd ..</span>
      </motion.button>
    </>
  )
}