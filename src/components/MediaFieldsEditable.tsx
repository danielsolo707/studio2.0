"use client"

import { useState } from 'react'
import { Plus, X, Image as ImageIcon, Video } from 'lucide-react'

interface MediaFieldsEditableProps {
  images: string[]
  videos: string[]
  onImagesChange: (images: string[]) => void
  onVideosChange: (videos: string[]) => void
}

export function MediaFieldsEditable({ images, videos, onImagesChange, onVideosChange }: MediaFieldsEditableProps) {
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

  return (
    <div className="space-y-3">
      {images.map((url, index) => (
        <div key={`img-${index}`} className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <ImageIcon className="w-4 h-4 text-[#DFFF00] flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => updateImage(index, e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 min-w-0 bg-transparent border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="text-white/40 hover:text-red-400 p-1 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {videos.map((url, index) => (
        <div key={`vid-${index}`} className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Video className="w-4 h-4 text-[#DFFF00] flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => updateVideo(index, e.target.value)}
              placeholder="https://vimeo.com/... or .mp4"
              className="flex-1 min-w-0 bg-transparent border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => removeVideo(index)}
            className="text-white/40 hover:text-red-400 p-1 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-2 px-3 py-1.5 border border-white/20 text-[10px] text-white/50 hover:border-[#DFFF00]/50 hover:text-[#DFFF00] transition-colors"
        >
          <Plus className="w-3 h-3" />
          ADD MEDIA
        </button>
        
        {showAddMenu && (
          <div className="absolute bottom-full left-0 mb-1 flex gap-2 z-50">
            <button
              type="button"
              onClick={() => { addImage(); setShowAddMenu(false) }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border border-[#DFFF00]/30 text-[#DFFF00] text-xs hover:bg-[#DFFF00]/20 whitespace-nowrap"
            >
              <ImageIcon className="w-3 h-3" />
              IMAGE
            </button>
            <button
              type="button"
              onClick={() => { addVideo(); setShowAddMenu(false) }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border border-[#DFFF00]/30 text-[#DFFF00] text-xs hover:bg-[#DFFF00]/20 whitespace-nowrap"
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
  initialMedia?: Array<{ type: 'image' | 'video'; url: string }>
}

export function ProjectMediaFields({ projectId, initialImageUrl, initialVideoUrl, initialMedia }: ProjectMediaFieldsProps) {
  const [mediaItems, setMediaItems] = useState<Array<{ type: 'image' | 'video'; url: string }>>(() => {
    if (initialMedia && initialMedia.length > 0) return initialMedia
    const items: Array<{ type: 'image' | 'video'; url: string }> = []
    if (initialImageUrl) items.push({ type: 'image', url: initialImageUrl })
    if (initialVideoUrl) items.push({ type: 'video', url: initialVideoUrl })
    return items
  })

  const images = mediaItems.filter(m => m.type === 'image').map(m => m.url)
  const videos = mediaItems.filter(m => m.type === 'video').map(m => m.url)

  const handleImagesChange = (newImages: string[]) => {
    const videoItems = mediaItems.filter(m => m.type === 'video')
    setMediaItems([
      ...newImages.map(url => ({ type: 'image' as const, url })),
      ...videoItems,
    ])
  }

  const handleVideosChange = (newVideos: string[]) => {
    const imageItems = mediaItems.filter(m => m.type === 'image')
    setMediaItems([
      ...imageItems,
      ...newVideos.map(url => ({ type: 'video' as const, url })),
    ])
  }

  const primaryImage = images[0] || ''
  const primaryVideo = videos[0] || ''

  return (
    <>
      <input type="hidden" name="imageUrl" value={primaryImage} />
      <input type="hidden" name="videoUrl" value={primaryVideo} />
      <input type="hidden" name="media" value={JSON.stringify(mediaItems.filter(m => m.url.trim() !== ''))} />
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">MEDIA URLs</p>
        <MediaFieldsEditable
          images={images}
          videos={videos}
          onImagesChange={handleImagesChange}
          onVideosChange={handleVideosChange}
        />
      </div>
    </>
  )
}