"use client"

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type UploadItem = {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'queued' | 'uploading' | 'complete' | 'error'
  error?: string
  file: File
}

export function MultiUploadField({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [items, setItems] = useState<UploadItem[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateItem = (id: string, patch: Partial<UploadItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item))
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newItems: UploadItem[] = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      progress: 0,
      status: 'queued' as const,
      file: f,
    }))
    setItems(prev => [...prev, ...newItems])
    e.target.value = ''
  }, [])

  const startUpload = useCallback(async () => {
    const queued = items.filter(i => i.status === 'queued')
    if (queued.length === 0) return
    setUploading(true)

    for (const item of queued) {
      updateItem(item.id, { status: 'uploading', progress: 0 })

      try {
        const buffer = await item.file.arrayBuffer()

        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/admin/upload/media')
        xhr.setRequestHeader('x-project-id', projectId)
        xhr.setRequestHeader('x-file-name', item.name)
        xhr.setRequestHeader('x-file-type', item.type)
        xhr.setRequestHeader('Content-Type', item.type)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            updateItem(item.id, { progress: Math.round((e.loaded / e.total) * 100) })
          }
        }

        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
          xhr.onerror = () => reject(new Error('Network error'))
          xhr.send(new Blob([buffer], { type: item.type }))
        })

        updateItem(item.id, { status: 'complete', progress: 100 })
      } catch (err) {
        updateItem(item.id, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed' })
      }
    }

    setUploading(false)
    router.refresh()
  }, [items, projectId, router])

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clearAll = () => setItems([])

  const hasQueuedItems = items.some(i => i.status === 'queued')

  return (
    <div className="w-full max-w-xl border border-white/10 p-4 rounded-md">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
        <div className="text-[10px] text-white/40">
          Saved to /public/uploads
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 border border-white/30 text-xs tracking-widest hover:border-[#DFFF00]/50 hover:text-[#DFFF00] transition-colors disabled:opacity-40"
        >
          CHOOSE FILES
        </button>
        <button
          type="button"
          onClick={startUpload}
          disabled={!hasQueuedItems || uploading}
          className="px-4 py-2 bg-[#DFFF00] text-black text-xs tracking-widest hover:bg-[#DFFF00]/80 disabled:opacity-40 transition-colors"
        >
          {uploading ? 'UPLOADING...' : 'START UPLOAD'}
        </button>
        {items.length > 0 && !uploading && (
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-2 border border-white/20 text-xs text-white/50 hover:text-white/80"
          >
            CLEAR
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="border border-white/10 px-3 py-2 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] truncate text-white/80">{item.name}</p>
                <p className="text-[10px] text-white/40">
                  {(item.size / 1024 / 1024).toFixed(1)}MB • {item.type.split('/')[1] || 'file'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.status === 'error' ? 'bg-red-500' :
                      item.status === 'complete' ? 'bg-[#DFFF00]' : 'bg-[#DFFF00]'
                    }`}
                    style={{
                      width: item.status === 'queued' ? '0%' : `${item.progress}%`,
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>

                <span className="text-[10px] w-16 text-right">
                  {item.status === 'queued' && 'Ready'}
                  {item.status === 'uploading' && `${item.progress}%`}
                  {item.status === 'complete' && '✓ Done'}
                  {item.status === 'error' && 'Failed'}
                </span>

                {item.status === 'error' && (
                  <button onClick={() => removeItem(item.id)} className="text-[10px] text-red-400 hover:text-red-300">
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-white/40 space-y-1">
        <p>• Max 50MB per file</p>
        <p>• Uploads directly to /public/uploads</p>
      </div>
    </div>
  )
}
