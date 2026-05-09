"use client"

import { useState } from 'react'
import { LINK_TYPE_LABELS, LINK_TYPE_OPTIONS } from '@/lib/project-meta'

type LinkItem = {
  id: number
  label: string
  url: string
  type: string
}

interface ProjectLinksProps {
  defaultType?: string
}

export function ProjectLinks({ defaultType = 'demo' }: ProjectLinksProps) {
  const [links, setLinks] = useState<LinkItem[]>([
    { id: 1, label: '', url: '', type: defaultType }
  ])

  const addLink = () => {
    setLinks([...links, { id: Date.now(), label: '', url: '', type: defaultType }])
  }

  const removeLink = (id: number) => {
    setLinks(links.filter(link => link.id !== id))
  }

  const updateLink = (id: number, field: string, value: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  return (
    <div className="md:col-span-2 border border-white/10 p-3">
      <p className="font-headline text-[10px] tracking-[0.3em] text-white/50 mb-3">
        PROJECT LINKS
      </p>
      
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={link.id} className="grid gap-2 md:grid-cols-[1fr_1fr_140px_40px] items-center">
            <input
              name={`linkLabel${index}`}
              value={link.label}
              onChange={(e) => updateLink(link.id, 'label', e.target.value)}
              placeholder="label"
              className="bg-transparent border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            />
            <input
              name={`linkUrl${index}`}
              value={link.url}
              onChange={(e) => updateLink(link.id, 'url', e.target.value)}
              placeholder="https://"
              className="bg-transparent border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            />
            <select
              name={`linkType${index}`}
              value={link.type}
              onChange={(e) => updateLink(link.id, 'type', e.target.value)}
              className="bg-[#030305] border border-white/10 px-2 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            >
              {LINK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{LINK_TYPE_LABELS[option]}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeLink(link.id)}
              className="text-white/40 hover:text-red-400 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Hidden inputs for form submission - ensure all possible indices are present */}
      <input type="hidden" name="linkCount" value={links.length} />

      <button
        type="button"
        onClick={addLink}
        className="mt-3 px-3 py-1.5 border border-white/20 text-[10px] tracking-widest text-white/50 hover:border-[#DFFF00]/50 hover:text-[#DFFF00] transition-colors"
      >
        + ADD LINK
      </button>
    </div>
  )
}