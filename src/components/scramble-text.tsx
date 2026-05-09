"use client"

import { useEffect, useState, useCallback } from "react"

interface ScrambleTextProps {
  text: string
  isActive: boolean
  className?: string
}

const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`01"

export function ScrambleText({ text, isActive, className = "" }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isScrambling, setIsScrambling] = useState(false)

  const scramble = useCallback(() => {
    if (isScrambling) return
    setIsScrambling(true)

    let iterations = 0
    const maxIterations = 10
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " "
            if (iterations > index * 1.5) return text[index]
            return symbols[Math.floor(Math.random() * symbols.length)]
          })
          .join("")
      )

      iterations += 1

      if (iterations >= maxIterations) {
        clearInterval(interval)
        setDisplayText(text)
        setIsScrambling(false)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [text, isScrambling])

  useEffect(() => {
    if (isActive && !isScrambling) {
      scramble()
    }
    if (!isActive) {
      setDisplayText(text)
    }
  }, [isActive, scramble, text, isScrambling])

  return <span className={className}>{displayText}</span>
}