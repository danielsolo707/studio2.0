"use client"

import React from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null

  return (
    <div 
      className="[&_p]:text-white/70 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:text-white/70 [&_li]:mb-1 [&_a]:text-[#DFFF00] [&_a]:hover:underline [&_strong]:text-white [&_strong]:font-semibold [&_em]:text-white/80"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}