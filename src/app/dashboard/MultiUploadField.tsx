"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'

type UploadItem = {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'queued' | 'uploading' | 'complete' | 'error'
  error?: string
}

export function MultiUploadField({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [storageType, setStorageType] = useState<'gridfs' | 'local'>('local')
  const [items, setItems] = useState<UploadItem[]>([])
  const [uppy, setUppy] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const uppyInstance = new Uppy({
      id: `upload-${projectId}`,
      autoProceed: false,
      restrictions: {
        maxFileSize: null,
        allowedFileTypes: ['image/*', 'video/*'],
      },
    })

    uppyInstance.use(Tus, {
      endpoint: storageType === 'local' 
        ? '/api/admin/upload/local' 
        : '/api/admin/upload/tus',
      chunkSize: 50 * 1024 * 1024,
      retryDelays: [0, 1000, 3000, 5000],
    })

    uppyInstance.on('file-added', (file: any) => {
      setItems(prev => [...prev, {
        id: file.id,
        name: file.name,
        size: file.size || 0,
        type: file.type || 'application/octet-stream',
        progress: 0,
        status: 'queued',
      }])
    })

    uppyInstance.on('upload-progress', (file: any, progress: any) => {
      setItems(prev => prev.map(item => 
        item.id === file.id 
          ? { ...item, progress: Math.round((progress.bytesUploaded / (progress.bytesTotal || 1)) * 100), status: 'uploading' }
          : item
      ))
    })

    uppyInstance.on('complete', (result: any) => {
      if (result.successful) {
        result.successful.forEach((file: any) => {
          setItems(prev => prev.map(item => 
            item.id === file.id 
              ? { ...item, progress: 100, status: 'complete' }
              : item
          ))

          const uploadData = file.response?.uploadData as { url?: string; fileId?: string } | undefined
          saveToProject(file.name, file.type || 'application/octet-stream', uploadData)
        })
        router.refresh()
      }
    })

    uppyInstance.on('error', (error: Error) => {
      console.error('Uppy error:', error)
      setItems(prev => prev.map(item => 
        item.status === 'uploading'
          ? { ...item, status: 'error', error: error.message }
          : item
      ))
    })

    setUppy(uppyInstance)

    return () => {
      uppyInstance.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, storageType])

  const saveToProject = async (filename: string, type: string, uploadData?: { url?: string; fileId?: string }) => {
    const url = uploadData?.url || `/uploads/${filename}`
    const fileId = uploadData?.fileId
    const storage = uploadData ? 'local' : storageType
    
    await fetch('/api/admin/upload/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-project-id': projectId,
      },
      body: JSON.stringify({
        url,
        fileId,
        storage,
        type: type.startsWith('image') ? 'image' : 'video',
      }),
    })
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && uppy) {
      Array.from(e.target.files).forEach((f) => {
        uppy.addFile({
          source: 'file-input',
          name: f.name,
          type: f.type,
          data: f,
          size: f.size,
        })
      })
      e.target.value = ''
    }
  }, [uppy])

  const startUpload = useCallback(() => {
    if (uppy) {
      uppy.upload()
    }
  }, [uppy])

  const clearItems = useCallback(() => {
    setItems([])
    if (uppy) {
      uppy.cancelAll()
    }
  }, [uppy])

  const hasQueuedItems = items.some(i => i.status === 'queued')
  const hasUploadingItems = items.some(i => i.status === 'uploading')

  return (
    <div className="w-full max-w-xl border border-white/10 p-4 rounded-md">
      {/* Storage Type Selector */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">
            STORAGE:
          </label>
          <select
            value={storageType}
            onChange={(e) => setStorageType(e.target.value as 'gridfs' | 'local')}
            disabled={hasUploadingItems}
            className="bg-[#030305] border border-white/20 px-3 py-1.5 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
          >
            <option value="gridfs">Database (GridFS)</option>
            <option value="local">Local Files</option>
          </select>
        </div>
        <div className="text-[10px] text-white/40">
          {storageType === 'gridfs' ? 'No disk space used' : 'Saved to /public/uploads'}
        </div>
      </div>

      {/* File Input */}
      <div className="flex items-center gap-2 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={hasUploadingItems}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={hasUploadingItems}
          className="px-4 py-2 border border-white/30 text-xs tracking-widest hover:border-[#DFFF00]/50 hover:text-[#DFFF00] transition-colors disabled:opacity-40"
        >
          CHOOSE FILES
        </button>
        <button
          type="button"
          onClick={startUpload}
          disabled={!hasQueuedItems || hasUploadingItems}
          className="px-4 py-2 bg-[#DFFF00] text-black text-xs tracking-widest hover:bg-[#DFFF00]/80 disabled:opacity-40 transition-colors"
        >
          {hasUploadingItems ? 'UPLOADING...' : 'START UPLOAD'}
        </button>
        {items.length > 0 && !hasUploadingItems && (
          <button
            type="button"
            onClick={clearItems}
            className="px-3 py-2 border border-white/20 text-xs text-white/50 hover:text-white/80"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Upload Queue */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="border border-white/10 px-3 py-2 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] truncate text-white/80">{item.name}</p>
                <p className="text-[10px] text-white/40">
                  {(item.size / 1024 / 1024).toFixed(1)}MB • {item.type.split('/')[1] || 'file'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Progress Bar */}
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      item.status === 'error' ? 'bg-red-500' :
                      item.status === 'complete' ? 'bg-[#DFFF00]' :
                      'bg-[#DFFF00]'
                    }`}
                    style={{ 
                      width: item.status === 'queued' ? '0%' : `${item.progress}%`,
                      transition: 'width 0.2s ease'
                    }}
                  />
                </div>

                {/* Status */}
                <span className="text-[10px] w-16 text-right">
                  {item.status === 'queued' && 'Ready'}
                  {item.status === 'uploading' && `${item.progress}%`}
                  {item.status === 'complete' && '✓ Done'}
                  {item.status === 'error' && 'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-white/40 space-y-1">
        <p>• No file size limit - upload any size</p>
        <p>• Resumable - resumes automatically if interrupted</p>
        <p>• Supports pause/resume during upload</p>
      </div>
    </div>
  )
}