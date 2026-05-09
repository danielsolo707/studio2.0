"use client"

import { useEffect, useRef } from "react"

export function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const noise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 15
      }

      ctx.putImageData(imageData, 0, 0)
    }

    resize()
    window.addEventListener("resize", resize)
    
    let lastTime = 0
    const fps = 12

    const animateThrottled = (currentTime: number) => {
      animationId = requestAnimationFrame(animateThrottled)
      
      if (currentTime - lastTime < 1000 / fps) return
      lastTime = currentTime
      
      noise()
    }

    animationId = requestAnimationFrame(animateThrottled)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
      style={{ mixBlendMode: "overlay" }}
    />
  )
}