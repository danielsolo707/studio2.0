"use client"

import { motion } from "framer-motion"

interface MotionBackgroundProps {
  isActive: boolean
}

export function MotionBackground({ isActive }: MotionBackgroundProps) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-black to-zinc-800/30" />
      
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(60,60,60,0.4) 0%, transparent 70%)",
          top: "20%",
          left: "30%",
        }}
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
          x: isActive ? [0, 30, 0] : 0,
          y: isActive ? [0, -20, 0] : 0,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(80,80,80,0.3) 0%, transparent 70%)",
          bottom: "30%",
          right: "20%",
        }}
        animate={{
          scale: isActive ? [1, 1.3, 1] : 1,
          x: isActive ? [0, -40, 0] : 0,
          y: isActive ? [0, 30, 0] : 0,
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
        }}
        animate={{
          opacity: isActive ? [0.5, 1, 0.5] : 0,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </motion.div>
  )
}