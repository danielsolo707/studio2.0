"use client"

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { addProjectAction } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import { ProjectLinks } from './ProjectLinks'
import { MultiUploadField } from './MultiUploadField'
import { EditableSelectField } from './EditableSelectField'
import { RichTextEditor } from '@/components/RichTextEditor'
import { MediaFields } from '@/components/MediaFields'

type DisciplineOptions = {
  statuses: string[]
  categories: string[]
  tools: string[]
}

type FormValues = {
  id?: string
  name?: string
  subtitle?: string
  year?: string
  category?: string
  status?: string
  tools?: string
  description?: string
  imageUrls?: string[]
  videoUrls?: string[]
}

type ActionState = { error?: string; success?: boolean; values?: FormValues }

const initialState: ActionState = { error: undefined, success: false }

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function fromKebabCase(str: string): string {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function AddMotionProjectForm({ options }: { options: DisciplineOptions }) {
  const [state, formAction] = useActionState(addProjectAction as any, initialState)
  
  const defaultStatus = options.statuses[0] || 'Case Study'
  const defaultCategory = options.categories[0] || ''
  const defaultTools = options.tools[0] || ''
  
  const [status, setStatus] = useState(defaultStatus)
  const [category, setCategory] = useState(defaultCategory)
  const [tools, setTools] = useState(defaultTools)
  
  const [formValues, setFormValues] = useState<FormValues>({})
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [videoUrls, setVideoUrls] = useState<string[]>([''])

  useEffect(() => {
    if (state?.success) {
      setFormValues({})
      setStatus(defaultStatus)
      setCategory(defaultCategory)
      setTools(defaultTools)
      setImageUrls([''])
      setVideoUrls([''])
    } else if (state && 'values' in state) {
      const values = state.values as FormValues | undefined
      if (values) {
        setFormValues(values)
        if (values.status) setStatus(fromKebabCase(values.status))
        if (values.category) setCategory(values.category)
        if (values.tools) setTools(fromKebabCase(values.tools))
      }
    }
  }, [state, defaultStatus, defaultCategory, defaultTools])

  const getValue = (key: keyof FormValues, defaultValue = ''): string => {
    const val = formValues[key]
    if (Array.isArray(val)) return defaultValue
    return (val as string | undefined) ?? defaultValue
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (formData: FormData) => {
    formData.set('status', toKebabCase(status))
    formData.set('category', category)
    formData.set('tools', tools)
    
    const filteredImages = imageUrls.filter(url => url.trim() !== '')
    const filteredVideos = videoUrls.filter(url => url.trim() !== '')
    
    if (filteredImages.length > 0) {
      formData.set('imageUrl', filteredImages[0])
    }
    if (filteredVideos.length > 0) {
      formData.set('videoUrl', filteredVideos[0])
    }
    
    // @ts-expect-error - useActionState type mismatch
    formAction(formData)
  }

  return (
    <form action={handleSubmit} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="discipline" value="motion" />
      
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-white/40 mb-2">MOTION PROJECT</p>
      </div>
      
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SLUG (URL)</p>
        <input 
          name="id" 
          value={getValue('id')}
          onChange={handleChange}
          placeholder="chrome-flow"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">PROJECT NAME</p>
        <input 
          name="name" 
          value={getValue('name')}
          onChange={handleChange}
          placeholder="Chrome Flow"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SUBTITLE (SHORT DESCRIPTION)</p>
        <input 
          name="subtitle" 
          value={getValue('subtitle')}
          onChange={handleChange}
          placeholder="A high-energy motion piece visualizing modern UI..."
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
          options={options.categories}
          value={category}
          onChange={setCategory}
        />
      </div>
      <div>
        <EditableSelectField
          label="STATUS"
          name="statuses"
          options={options.statuses}
          value={status}
          onChange={setStatus}
        />
      </div>
      <div>
        <EditableSelectField
          label="TOOLS"
          name="tools"
          options={options.tools}
          value={tools}
          onChange={setTools}
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
        <RichTextEditor
          name="description"
          value={getValue('description')}
          onChange={(value) => setFormValues(prev => ({ ...prev, description: value }))}
          placeholder="Enter a brief description of the project... Use **bold**, *italic*, - for lists, [text](url) for links."
          rows={5}
        />
      </div>
      <ProjectLinks defaultType="video" />
      
      <div className="md:col-span-2 mt-4">
        <div className="border border-white/10 p-4 rounded-md">
          <p className="text-[10px] tracking-[0.3em] text-white/40 mb-3">MEDIA UPLOAD</p>
          <p className="text-xs text-white/50 mb-3">
            After creating the project, you can add images/videos from the edit form.
          </p>
          <MultiUploadField projectId="" />
        </div>
      </div>
      
      <SubmitButton>ADD MOTION PROJECT</SubmitButton>
      {state?.error && (
        <p className="text-xs text-red-400 md:col-span-2">{state.error}</p>
      )}
    </form>
  )
}