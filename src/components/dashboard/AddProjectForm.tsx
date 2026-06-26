"use client"

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { addProjectAction } from '@/app/dashboard/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { ProjectLinks } from './ProjectLinks'
import { EditableSelectField } from './EditableSelectField'
import { MediaFields } from '@/components/MediaFields'
import {
  DISCIPLINE_LABELS,
  DISCIPLINE_OPTIONS,
  LINK_TYPE_LABELS,
  LINK_TYPE_OPTIONS,
} from '@/lib/project-meta'

type FormValues = {
  id?: string
  name?: string
  year?: string
  category?: string
  discipline?: string
  status?: string
  tools?: string
  color?: string
  imageUrl?: string
  videoUrl?: string
  description?: string
  challenge?: string
  solution?: string
  imageUrls?: string[]
  videoUrls?: string[]
}

type ActionState = { error?: string; success?: boolean; values?: FormValues }

const initialState: ActionState = { error: undefined, success: false }

const defaultOptions = {
  statuses: ['Case Study', 'Prototype', 'Experiment', 'Learning Project'],
  categories: ['Motion Design', '3D Animation', 'Visual Effects', 'Branding', 'Showreel'],
  tools: ['After Effects', 'Cinema 4D', 'Blender', 'Houdini', 'Premiere Pro', 'Photoshop', 'Illustrator']
}

export function AddProjectForm() {
  const [state, formAction] = useActionState(addProjectAction as any, initialState)
  
  const [status, setStatus] = useState(defaultOptions.statuses[0] || 'Case Study')
  const [category, setCategory] = useState(defaultOptions.categories[0] || '')
  const [tools, setTools] = useState(defaultOptions.tools[0] || '')
  const [discipline, setDiscipline] = useState('motion')
  
  const [formValues, setFormValues] = useState<FormValues>({})
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [videoUrls, setVideoUrls] = useState<string[]>([''])

  useEffect(() => {
    if (state?.success) {
      setFormValues({})
      setStatus(defaultOptions.statuses[0] || 'Case Study')
      setCategory(defaultOptions.categories[0] || '')
      setTools(defaultOptions.tools[0] || '')
      setDiscipline('motion')
      setImageUrls([''])
      setVideoUrls([''])
    } else if (state && 'values' in state) {
      const values = state.values as FormValues | undefined
      if (values) {
        setFormValues(values)
        if (values.status) setStatus(values.status)
        if (values.category) setCategory(values.category)
        if (values.tools) setTools(values.tools)
        if (values.discipline) setDiscipline(values.discipline)
      }
    }
  }, [state])

  const getValue = (key: keyof FormValues, defaultValue = ''): string => {
    const val = formValues[key]
    if (Array.isArray(val)) return defaultValue
    return (val as string | undefined) ?? defaultValue
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (formData: FormData) => {
    formData.set('status', status.toLowerCase().replace(/\s+/g, '-'))
    formData.set('category', category)
    formData.set('tools', tools)
    formData.set('discipline', discipline)
    
    const filteredImages = imageUrls.filter(url => url.trim() !== '')
    const filteredVideos = videoUrls.filter(url => url.trim() !== '')
    
    if (filteredImages.length > 0) {
      formData.set('imageUrl', filteredImages[0])
    }
    if (filteredVideos.length > 0) {
      formData.set('videoUrl', filteredVideos[0])
    }
    
    const mediaItems = [
      ...filteredImages.map(url => ({ type: 'image' as const, url })),
      ...filteredVideos.map(url => ({ type: 'video' as const, url })),
    ]
    if (mediaItems.length > 0) {
      formData.set('media', JSON.stringify(mediaItems))
    }
    
    // @ts-expect-error - useActionState type mismatch
    formAction(formData)
  }

  return (
    <form action={handleSubmit} className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-white/40 mb-2">PROJECT</p>
      </div>
      
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SLUG (URL)</p>
        <input 
          name="id" 
          value={getValue('id')}
          onChange={handleChange}
          placeholder="my-project"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">PROJECT NAME</p>
        <input 
          name="name" 
          value={getValue('name')}
          onChange={handleChange}
          placeholder="My Project"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">YEAR</p>
        <input 
          name="year" 
          value={getValue('year')}
          onChange={handleChange}
          placeholder="2024"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div>
        <EditableSelectField
          label="CATEGORY"
          name="categories"
          options={defaultOptions.categories}
          value={category}
          onChange={setCategory}
        />
      </div>
      <div>
        <EditableSelectField
          label="DISCIPLINE"
          name="disciplines"
          options={DISCIPLINE_OPTIONS}
          value={discipline}
          onChange={setDiscipline}
        />
      </div>
      <div>
        <EditableSelectField
          label="STATUS"
          name="statuses"
          options={defaultOptions.statuses}
          value={status}
          onChange={setStatus}
        />
      </div>
      <div>
        <EditableSelectField
          label="TOOLS"
          name="tools"
          options={defaultOptions.tools}
          value={tools}
          onChange={setTools}
        />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">ACCENT COLOR</p>
        <input 
          name="color" 
          value={getValue('color')}
          onChange={handleChange}
          placeholder="#DFFF00"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">MEDIA URLs</p>
        <MediaFields
          images={imageUrls}
          videos={videoUrls}
          onImagesChange={setImageUrls}
          onVideosChange={setVideoUrls}
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">DESCRIPTION</p>
        <textarea 
          name="description"
          value={getValue('description')}
          onChange={handleChange}
          placeholder="Enter a brief description of the project..."
          rows={5}
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none font-body text-sm"
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">CHALLENGE (CODE STYLE)</p>
        <textarea 
          name="challenge"
          value={getValue('challenge')}
          onChange={handleChange}
          placeholder="// Describe the main challenge..."
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none font-mono text-sm"
          rows={4}
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SOLUTION (CODE STYLE)</p>
        <textarea 
          name="solution"
          value={getValue('solution')}
          onChange={handleChange}
          placeholder="// Describe the solution..."
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none font-mono text-sm"
          rows={4}
        />
      </div>
      <ProjectLinks defaultType="demo" />
      
      <SubmitButton>ADD PROJECT</SubmitButton>
      {state?.success && (
        <p className="text-xs text-[#DFFF00] md:col-span-2">Project added successfully!</p>
      )}
      {state?.error && (
        <p className="text-xs text-red-400 md:col-span-2">{state.error}</p>
      )}
    </form>
  )
}