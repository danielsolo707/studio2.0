"use client"

import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Image as ImageIcon, Video } from 'lucide-react'
import type { Project } from '@/types/project'

type MediaItem = Project['media'][number]

interface MediaFieldsEditableProps {
  mediaItems: MediaItem[]
  onMediaChange: (mediaItems: MediaItem[]) => void
}

function getInitialMedia(
  initialImageUrl: string,
  initialVideoUrl: string,
  initialMedia?: MediaItem[],
): MediaItem[] {
  if (initialMedia && initialMedia.length > 0) return initialMedia

  const items: MediaItem[] = []
  if (initialImageUrl) items.push({ type: 'image', url: initialImageUrl })
  if (initialVideoUrl) items.push({ type: 'video', url: initialVideoUrl })
  return items
}

export function MediaFieldsEditable({ mediaItems, onMediaChange }: MediaFieldsEditableProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const addMedia = (type: MediaItem['type']) => {
    onMediaChange([...mediaItems, { type, url: '' }])
  }

  const removeMedia = (index: number) => {
    onMediaChange(mediaItems.filter((_, i) => i !== index))
  }

  const updateMediaUrl = (index: number, value: string) => {
    onMediaChange(mediaItems.map((item, i) => (
      i === index ? { ...item, url: value } : item
    )))
  }

  return (
    <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.02] p-3">
      {mediaItems.map((item, index) => {
        const Icon = item.type === 'image' ? ImageIcon : Video
        const label = item.type === 'image' ? 'IMAGE' : 'VIDEO'
        const placeholder = item.type === 'image'
          ? 'https://example.com/image.jpg'
          : 'https://vimeo.com/... or .mp4'

        return (
        <div key={`${item.type}-${index}`} className="grid gap-2 sm:grid-cols-[96px_minmax(0,1fr)_32px] sm:items-center">
          <span className="inline-flex h-8 items-center justify-center gap-2 rounded border border-[#DFFF00]/30 bg-[#DFFF00]/10 px-2 text-[10px] font-medium tracking-widest text-[#DFFF00]">
            <Icon className="h-3 w-3" aria-hidden="true" />
            {label}
          </span>
          <div className="min-w-0">
            <input
              type="text"
              value={item.url}
              onChange={(e) => updateMediaUrl(index, e.target.value)}
              placeholder={placeholder}
              className="w-full min-w-0 rounded border border-white/10 bg-black/20 px-3 py-2 text-xs outline-none transition-colors focus:border-[#DFFF00]/60"
            />
          </div>
          <button
            type="button"
            onClick={() => removeMedia(index)}
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 text-white/40 transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
            aria-label={`Remove ${item.type} URL`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        )
      })}

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex h-9 items-center gap-2 rounded border border-white/15 bg-white/[0.03] px-3 text-[10px] tracking-widest text-white/55 transition-colors hover:border-[#DFFF00]/50 hover:bg-[#DFFF00]/10 hover:text-[#DFFF00]"
          aria-expanded={showAddMenu}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          ADD MEDIA
        </button>
        
        {showAddMenu && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { addMedia('image'); setShowAddMenu(false) }}
              className="flex h-8 items-center gap-2 rounded border border-[#DFFF00]/30 bg-[#0a0a0a] px-3 text-xs text-[#DFFF00] transition-colors hover:bg-[#DFFF00]/20"
            >
              <ImageIcon className="h-3 w-3" aria-hidden="true" />
              IMAGE
            </button>
            <button
              type="button"
              onClick={() => { addMedia('video'); setShowAddMenu(false) }}
              className="flex h-8 items-center gap-2 rounded border border-[#DFFF00]/30 bg-[#0a0a0a] px-3 text-xs text-[#DFFF00] transition-colors hover:bg-[#DFFF00]/20"
            >
              <Video className="h-3 w-3" aria-hidden="true" />
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
  initialMedia?: MediaItem[]
}

export function ProjectMediaFields({ projectId, initialImageUrl, initialVideoUrl, initialMedia }: ProjectMediaFieldsProps) {
  const initialMediaKey = useMemo(
    () => JSON.stringify(getInitialMedia(initialImageUrl, initialVideoUrl, initialMedia)),
    [initialImageUrl, initialMedia, initialVideoUrl],
  )
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => (
    getInitialMedia(initialImageUrl, initialVideoUrl, initialMedia)
  ))

  useEffect(() => {
    setMediaItems(JSON.parse(initialMediaKey) as MediaItem[])
  }, [initialMediaKey])

  const primaryImage = mediaItems.find((m) => m.type === 'image')?.url || ''
  const primaryVideo = mediaItems.find((m) => m.type === 'video')?.url || ''

  return (
    <>
      <input type="hidden" name="imageUrl" value={primaryImage} />
      <input type="hidden" name="videoUrl" value={primaryVideo} />
      <input type="hidden" name="media" value={JSON.stringify(mediaItems.filter(m => m.url.trim() !== ''))} />
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">MEDIA URLs</p>
        <MediaFieldsEditable
          mediaItems={mediaItems}
          onMediaChange={setMediaItems}
        />
      </div>
    </>
  )
}
