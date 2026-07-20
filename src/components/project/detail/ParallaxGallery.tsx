"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Folder, Monitor, Terminal, ImageOff } from "lucide-react"

interface GalleryImage {
  src: string
  alt: string
  type?: "browser" | "terminal"
}

interface ParallaxGalleryProps {
  images: GalleryImage[]
}

function GalleryItem({ image, index }: { image: GalleryImage; index: number }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [imageError, setImageError] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    setMousePosition({ x: x * 10, y: y * 10 })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      style={{
        transform: `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className="relative"
    >
      <div 
        className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-border shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-[#0d0d0d] border-b border-border">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#27ca40]" />
          </div>
          
          <div className="flex items-center gap-2 ml-2 sm:ml-4 text-xs font-mono text-muted-foreground">
            {image.type === "terminal" ? (
              <>
                <Terminal className="w-3 h-3 hidden sm:block" />
                <span className="truncate">Terminal</span>
              </>
            ) : (
              <>
                <Monitor className="w-3 h-3 hidden sm:block" />
                <span className="truncate">Preview</span>
              </>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/3] sm:aspect-video bg-[#0a0a0a]">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="w-8 h-8 text-muted-foreground/50" />
            </div>
          ) : (
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.3) 2px,
                rgba(0,0,0,0.3) 4px
              )`
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export function ParallaxGallery({ images }: ParallaxGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
          <Folder className="w-4 h-4" />
          <span>PROJECT GALLERY</span>
        </div>
        <div className="flex items-center justify-center aspect-video bg-muted/20 rounded-lg border border-border">
          <div className="text-center text-muted-foreground">
            <ImageOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No images available</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
        <Folder className="w-4 h-4" />
        <span>PROJECT GALLERY</span>
      </div>

      <div className="grid gap-6">
        {images.map((image, index) => (
          <GalleryItem key={index} image={image} index={index} />
        ))}
      </div>
    </motion.div>
  )
}