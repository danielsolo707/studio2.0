"use client"

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { addProjectAction } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { ProjectLinks } from './ProjectLinks';
import { MultiUploadField } from './MultiUploadField';
import { EditableSelectField } from './EditableSelectField';

type DisciplineOptions = {
  statuses: string[]
  categories: string[]
  tools: string[]
}

type FormValues = {
  id?: string
  name?: string
  year?: string
  category?: string
  status?: string
  tools?: string
  imageUrl?: string
  videoUrl?: string
  description?: string
}

type ActionState = { error?: string; success?: boolean; values?: FormValues }

const initialState: ActionState = { error: undefined, success: false }

const defaultOptions: DisciplineOptions = {
  statuses: ['Case Study', 'Prototype', 'Experiment', 'Learning Project'],
  categories: ['Web App', 'Website', 'Data Visualization', 'Tool', 'Interactive', 'Game', 'API/Backend', 'Machine Learning'],
  tools: ['React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Three.js', 'TensorFlow', 'PostgreSQL', 'MongoDB', 'Docker', 'Figma']
}

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function fromKebabCase(str: string): string {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function AddCodeProjectForm({ options }: { options?: DisciplineOptions }) {
  const [state, formAction] = useActionState(addProjectAction, initialState);
  
  const opts = options ?? defaultOptions
  const [status, setStatus] = useState(opts.statuses[0] || 'Case Study')
  const [category, setCategory] = useState(opts.categories[0] || '')
  const [tools, setTools] = useState(opts.tools[0] || '')
  
  const [formValues, setFormValues] = useState<FormValues>({})

  useEffect(() => {
    if (state?.values) {
      setFormValues(state.values)
      if (state.values.status) setStatus(fromKebabCase(state.values.status))
      if (state.values.category) setCategory(state.values.category)
      if (state.values.tools) setTools(state.values.tools)
    }
  }, [state])

  const getValue = (key: keyof FormValues, defaultValue = '') => {
    return formValues[key] ?? defaultValue
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (formData: FormData) => {
    formData.set('status', toKebabCase(status))
    formData.set('category', category)
    formData.set('tools', tools)
    formAction(formData)
  }

  return (
    <form action={handleSubmit} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="discipline" value="code" />
      
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-white/40 mb-2">CODE PROJECT</p>
      </div>
      
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SLUG (URL)</p>
        <input 
          name="id" 
          value={getValue('id')}
          onChange={handleChange}
          placeholder="portfolio-admin"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">PROJECT NAME</p>
        <input 
          name="name" 
          value={getValue('name')}
          onChange={handleChange}
          placeholder="Portfolio Admin System"
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
          options={opts.categories}
          value={category}
          onChange={setCategory}
        />
      </div>
      <div>
        <EditableSelectField
          label="STATUS"
          name="statuses"
          options={opts.statuses}
          value={status}
          onChange={setStatus}
        />
      </div>
      <div>
        <EditableSelectField
          label="TOOLS"
          name="tools"
          options={opts.tools}
          value={tools}
          onChange={setTools}
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">MAIN IMAGE URL</p>
        <input 
          name="imageUrl" 
          value={getValue('imageUrl')}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">VIDEO URL (OPTIONAL)</p>
        <input 
          name="videoUrl" 
          value={getValue('videoUrl')}
          onChange={handleChange}
          placeholder="https://youtube.com/..."
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">DESCRIPTION</p>
        <textarea 
          name="description" 
          value={getValue('description')}
          onChange={handleChange}
          placeholder="Enter project details. Use titles like 'Objective:', 'Approach:', 'Outcome:', 'Next Step:' to organize your content."
          rows={10} 
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none font-body text-sm" 
        />
      </div>
      <ProjectLinks defaultType="github" />
      
      <div className="md:col-span-2 mt-4">
        <div className="border border-white/10 p-4 rounded-md">
          <p className="text-[10px] tracking-[0.3em] text-white/40 mb-3">MEDIA UPLOAD</p>
          <p className="text-xs text-white/50 mb-3">
            After creating the project, you can add images/videos from the edit form.
          </p>
          <MultiUploadField projectId="" />
        </div>
      </div>
      
      <SubmitButton>ADD CODE PROJECT</SubmitButton>
      {state?.error && (
        <p className="text-xs text-red-400 md:col-span-2">{state.error}</p>
      )}
    </form>
  );
}