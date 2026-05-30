"use client"

import React, { useState } from 'react'
import { Plus, X, Image, Video } from 'lucide-react'

interface MediaFieldsProps {
  images: string[]
  videos: string[]
  onImagesChange: (images: string[]) => void
  onVideosChange: (videos: string[]) => void
}

export function MediaFields({ images, videos, onImagesChange, onVideosChange }: MediaFieldsProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const addImage = () => {
    onImagesChange([...images, ''])
  }

  const addVideo = () => {
    onVideosChange([...videos, ''])
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index))
  }

  const updateImage = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    onImagesChange(newImages)
  }

  const updateVideo = (index: number, value: string) => {
    const newVideos = [...videos]
    newVideos[index] = value
    onVideosChange(newVideos)
  }

  const hasImages = images.length > 0 && images.some(img => img.trim() !== '')
  const hasVideos = videos.length > 0 && videos.some(vid => vid.trim() !== '')

  return (
    <div className="space-y-3">
      {/* Image URLs */}
      {images.map((url, index) => (
        <div key={`img-${index}`} className="flex items-center gap-2">
          <Image size={14} className="text-white/40 flex-shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => updateImage(index, e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-transparent border border-white/10 px-3 py-2 text-white text-sm placeholder:text-white/20 focus:border-[#DFFF00]/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="p-1 text-white/40 hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Video URLs */}
      {videos.map((url, index) => (
        <div key={`vid-${index}`} className="flex items-center gap-2">
          <Video size={14} className="text-white/40 flex-shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => updateVideo(index, e.target.value)}
            placeholder="https://vimeo.com/..., https://youtube.com/... or .mp4"
            className="flex-1 bg-transparent border border-white/10 px-3 py-2 text-white text-sm placeholder:text-white/20 focus:border-[#DFFF00]/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeVideo(index)}
            className="p-1 text-white/40 hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Add button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#DFFF00] hover:text-white transition-colors"
        >
          <Plus size={14} />
          ADD MEDIA
        </button>

        {showAddMenu && (
          <div className="absolute left-0 top-8 bg-[#161b22] border border-white/10 rounded p-2 z-10">
            <button
              type="button"
              onClick={() => { addImage(); setShowAddMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded"
            >
              <Image size={14} />
              Add Image URL
            </button>
            <button
              type="button"
              onClick={() => { addVideo(); setShowAddMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded"
            >
              <Video size={14} />
              Add Video URL
            </button>
          </div>
        )}
      </div>

      {!hasImages && !hasVideos && (
        <p className="text-[10px] text-white/30">No media added yet</p>
      )}
    </div>
  )
}