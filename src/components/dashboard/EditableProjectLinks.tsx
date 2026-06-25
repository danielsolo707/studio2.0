"use client"

import { useState, useEffect } from 'react'
import { LINK_TYPE_LABELS, LINK_TYPE_OPTIONS } from '@/lib/project-meta'
import type { ProjectLink } from '@/types/project'

interface EditableProjectLinksProps {
  defaultLinks?: ProjectLink[]
  defaultType?: string
}

export function EditableProjectLinks({ defaultLinks = [], defaultType = 'demo' }: EditableProjectLinksProps) {
  const [links, setLinks] = useState<{ id: number; label: string; url: string; type: string }[]>(() => {
    if (defaultLinks.length > 0) {
      return defaultLinks.map((link, index) => ({
        id: index,
        label: link.label,
        url: link.url,
        type: link.type
      }))
    }
    return [{ id: 0, label: '', url: '', type: defaultType }]
  })

  useEffect(() => {
    if (defaultLinks.length > 0) {
      setLinks(defaultLinks.map((link, index) => ({
        id: index,
        label: link.label,
        url: link.url,
        type: link.type
      })))
    }
  }, [defaultLinks])

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
              defaultValue={link.label}
              placeholder="label"
              className="bg-transparent border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            />
            <input
              name={`linkUrl${index}`}
              defaultValue={link.url}
              placeholder="https://"
              className="bg-transparent border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
            />
            <select
              name={`linkType${index}`}
              defaultValue={link.type}
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