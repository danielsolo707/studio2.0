"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface CodeBackgroundProps {
  isActive: boolean
}

const codeLines = [
  "const creative = {",
  "  type: 'developer',",
  "  skills: ['react', 'motion'],",
  "  passion: 'infinite',",
  "};",
  "",
  "function createMagic() {",
  "  return innovation++;",
  "}",
  "",
  "export default creative;",
]

export function CodeBackground({ isActive }: CodeBackgroundProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])

  useEffect(() => {
    if (isActive) {
      const timeouts: NodeJS.Timeout[] = []
      codeLines.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setVisibleLines(prev => [...prev, index])
        }, index * 100)
        timeouts.push(timeout)
      })
      return () => timeouts.forEach(clearTimeout)
    } else {
      setVisibleLines([])
    }
  }, [isActive])

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(173,255,47,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          opacity: isActive ? [0.5, 0.8, 0.5] : 0,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="font-mono text-xs sm:text-sm opacity-20 text-[#ADFF2F] space-y-1 max-w-xs">
          {codeLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: visibleLines.includes(index) ? 1 : 0,
                x: visibleLines.includes(index) ? 0 : -10,
              }}
              transition={{ duration: 0.3 }}
            >
              {line || "\u00A0"}
            </motion.div>
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-2 h-4 bg-[#ADFF2F]"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </motion.div>
  )
}