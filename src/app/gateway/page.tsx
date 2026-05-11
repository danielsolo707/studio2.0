"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FilmGrain } from "@/components/film-grain"
import { ScrambleText } from "@/components/scramble-text"
import { MotionBackground } from "@/components/motion-background"
import { CodeBackground } from "@/components/code-background"

type HoveredSide = "motion" | "code" | null

export default function GatewayPage() {
  const [hoveredSide, setHoveredSide] = useState<HoveredSide>(null)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden">
      <FilmGrain />

      <div className="relative flex flex-col lg:flex-row min-h-screen">
        <motion.div
          className="relative flex-1 min-h-[50vh] lg:min-h-screen cursor-pointer portal-motion"
          animate={{
            flex: hoveredSide === "motion" ? 1.15 : hoveredSide === "code" ? 0.85 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          onMouseEnter={() => setHoveredSide("motion")}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <Link href="/works/motion" className="absolute inset-0 z-50">
            <span className="sr-only">Go to Motion Design works</span>
          </Link>

          <MotionBackground isActive={hoveredSide === "motion"} />

          <div className="relative z-10 flex flex-col items-center justify-start sm:justify-center h-full px-4 sm:px-6 lg:px-12 pt-[140px] sm:pt-0">
            <motion.span
              className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-zinc-500 uppercase mb-2 sm:mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Visual Stories
            </motion.span>

            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white"
              style={{ mixBlendMode: "difference" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              MOTION
            </motion.h1>

            <motion.p
              className="mt-3 sm:mt-6 text-xs sm:text-sm text-zinc-400 max-w-[200px] sm:max-w-xs text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              3D animation, motion graphics, and cinematic design
            </motion.p>

            <motion.div
              className="mt-4 sm:mt-8 flex items-center gap-2 text-zinc-500"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <span className="text-[10px] sm:text-xs tracking-wider">TAP TO ENTER</span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </motion.div>
          </div>

          <div className="hidden lg:block absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />
        </motion.div>

        <motion.div
          className="relative flex-1 min-h-[50vh] lg:min-h-screen cursor-pointer portal-code"
          animate={{
            flex: hoveredSide === "code" ? 1.15 : hoveredSide === "motion" ? 0.85 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          onMouseEnter={() => setHoveredSide("code")}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <Link href="/works/code" className="absolute inset-0 z-50">
            <span className="sr-only">Go to Creative Code works</span>
          </Link>

          <CodeBackground isActive={hoveredSide === "code"} />

          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-12">
            <motion.span
              className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-zinc-500 uppercase mb-2 sm:mb-4 font-mono"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {"// Creative Tech"}
            </motion.span>

            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-bold tracking-tighter font-mono"
              style={{ color: "#ADFF2F" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <ScrambleText text="CODE" isActive={hoveredSide === "code"} />
            </motion.h1>

            <motion.p
              className="mt-3 sm:mt-6 text-xs sm:text-sm text-zinc-400 max-w-[200px] sm:max-w-xs text-center font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Web applications, creative tools, and experimental projects
            </motion.p>

            <motion.div
              className="mt-4 sm:mt-8 flex items-center gap-2"
              style={{ color: "#ADFF2F" }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <span className="text-[10px] sm:text-xs tracking-wider font-mono">{">"} TAP TO ENTER</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                _
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-4 sm:bottom-8 left-0 right-0 flex justify-center z-[200] pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/"
            className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 border border-zinc-800 rounded-full bg-black/50 backdrop-blur-sm hover:border-zinc-600 transition-all duration-300"
          >
            <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-mono text-zinc-500 bg-zinc-900 rounded border border-zinc-800 group-hover:text-zinc-300 group-hover:border-zinc-700 transition-colors">
              ESC
            </kbd>
            <span className="text-[10px] sm:text-xs text-zinc-500 tracking-wider group-hover:text-zinc-300 transition-colors">
              BACK
            </span>
          </Link>
        </motion.div>
      </div>

      <div className="hidden sm:block fixed top-6 left-6 z-20">
        <motion.div
          className="w-6 h-6 border-l border-t border-zinc-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />
      </div>
      <div className="hidden sm:block fixed top-6 right-6 z-20">
        <motion.div
          className="w-6 h-6 border-r border-t border-zinc-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        />
      </div>
      <div className="hidden sm:block fixed bottom-6 left-6 z-20">
        <motion.div
          className="w-6 h-6 border-l border-b border-zinc-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        />
      </div>
      <div className="hidden sm:block fixed bottom-6 right-6 z-20">
        <motion.div
          className="w-6 h-6 border-r border-b border-zinc-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        />
      </div>

      <AnimatePresence>
        {!hoveredSide && (
          <motion.div
            className="hidden lg:flex fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
            <span className="text-[10px] text-zinc-600 tracking-widest rotate-90 origin-center">
              SELECT
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}