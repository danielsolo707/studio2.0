"use client"

import { useState, useActionState } from 'react'
import { updateOptionsAction } from './actions'

type EditableSelectProps = {
  label: string
  name: 'statuses' | 'categories' | 'tools' | 'disciplines' | 'linkTypes'
  options: string[]
  defaultValue?: string
}

const initialState = { error: undefined as string | undefined, success: false }

export function EditableSelect({ label, name, options, defaultValue }: EditableSelectProps) {
  const [localOptions, setLocalOptions] = useState(options)
  const [newOption, setNewOption] = useState('')
  const [state, formAction] = useActionState(updateOptionsAction, initialState)

  const addOption = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOption.trim()) return
    
    const updatedOptions = [...localOptions, newOption.trim()]
    setLocalOptions(updatedOptions)
    setNewOption('')
    
    const formData = new FormData()
    formData.append(name, JSON.stringify(updatedOptions))
    formAction(formData)
  }

  const removeOption = (optionToRemove: string) => {
    const updatedOptions = localOptions.filter(o => o !== optionToRemove)
    setLocalOptions(updatedOptions)
    
    const formData = new FormData()
    formData.append(name, JSON.stringify(updatedOptions))
    formAction(formData)
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">{label}</p>
      
      <div className="flex flex-wrap gap-1.5 mb-2">
        {localOptions.map((option) => (
          <div 
            key={option} 
            className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 text-xs"
          >
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name={name} 
                value={option} 
                defaultChecked={option === defaultValue}
                className="sr-only"
              />
              <span className="px-1">{option}</span>
            </label>
            <button
              type="button"
              onClick={() => removeOption(option)}
              className="text-white/30 hover:text-red-400 text-xs leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addOption} className="flex gap-2">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Add new..."
          className="flex-1 bg-transparent border border-white/10 px-2 py-1 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newOption.trim()}
          className="px-2 py-1 border border-white/20 text-[10px] text-white/50 hover:border-[#DFFF00] hover:text-[#DFFF00] disabled:opacity-30 transition-colors"
        >
          +
        </button>
      </form>
    </div>
  )
}