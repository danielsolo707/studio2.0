"use client"

import React, { useState, useRef } from 'react'

interface RichTextEditorProps {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function RichTextEditor({ name, value, onChange, placeholder, rows = 5 }: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="border border-white/10 focus-within:border-[#DFFF00]/50 focus-within:outline-none focus-within:ring-1 focus-within:ring-[#DFFF00]/30 transition-colors">
      <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 bg-white/[0.02]">
        <span className="text-[10px] text-white/30">HTML supported</span>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-[10px] text-[#DFFF00] hover:underline"
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {showPreview ? (
        <div 
          className="w-full min-h-[120px] px-3 py-2 bg-black/20 text-white/80 text-sm overflow-auto"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-transparent px-3 py-2 focus:outline-none font-mono text-sm text-white placeholder:text-white/20 resize-none"
        />
      )}
    </div>
  )
}