"use client"

import { useState, useEffect } from 'react'
import { Plus, X, Image, Video } from 'lucide-react'

interface MediaFieldsProps {
  images: string[]
  videos: string[]
  onImagesChange: (images: string[]) => void
  onVideosChange: (videos: string[]) => void
}

export function MediaFieldsEditable({ images, videos, onImagesChange, onVideosChange }: MediaFieldsProps) {
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
      {images.map((url, index) => (
        <div key={`img-${index}`} className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Image className="w-4 h-4 text-[#DFFF00]" />
            <input
              type="url"
              value={url}
              onChange={(e) => updateImage(index, e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 bg-transparent border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="text-white/40 hover:text-red-400 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {videos.map((url, index) => (
        <div key={`vid-${index}`} className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Video className="w-4 h-4 text-[#DFFF00]" />
            <input
              type="url"
              value={url}
              onChange={(e) => updateVideo(index, e.target.value)}
              placeholder="https://youtube.com/..."
              className="flex-1 bg-transparent border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => removeVideo(index)}
            className="text-white/40 hover:text-red-400 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-2 px-3 py-1.5 border border-white/20 text-[10px] text-white/50 hover:border-[#DFFF00]/50 hover:text-[#DFFF00] transition-colors"
        >
          <Plus className="w-3 h-3" />
          ADD MEDIA
        </button>
        
        {showAddMenu && (
          <div className="absolute top-full left-0 mt-1 flex gap-2 z-10">
            <button
              type="button"
              onClick={() => { addImage(); setShowAddMenu(false) }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#DFFF00]/10 border border-[#DFFF00]/30 text-[#DFFF00] text-xs hover:bg-[#DFFF00]/20"
            >
              <Image className="w-3 h-3" />
              IMAGE
            </button>
            <button
              type="button"
              onClick={() => { addVideo(); setShowAddMenu(false) }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#DFFF00]/10 border border-[#DFFF00]/30 text-[#DFFF00] text-xs hover:bg-[#DFFF00]/20"
            >
              <Video className="w-3 h-3" />
              VIDEO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProjectMediaFieldsProps {
  projectId: string
  initialImageUrl: string
  initialVideoUrl: string
}

export function ProjectMediaFields({ projectId, initialImageUrl, initialVideoUrl }: ProjectMediaFieldsProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '')

  return (
    <>
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="videoUrl" value={videoUrl} />
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">MEDIA URLs</p>
        <MediaFieldsEditable
          images={imageUrl ? [imageUrl] : []}
          videos={videoUrl ? [videoUrl] : []}
          onImagesChange={(imgs) => setImageUrl(imgs[0] || '')}
          onVideosChange={(vids) => setVideoUrl(vids[0] || '')}
        />
      </div>
    </>
  )
}