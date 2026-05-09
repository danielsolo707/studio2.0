"use client"

import { useState, useActionState } from 'react'
import { updateOptionsAction } from './actions'

type FieldProps = {
  label: string
  name: 'statuses' | 'categories' | 'tools' | 'disciplines' | 'linkTypes'
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function EditableSelectField({ label, name, options, value, onChange }: FieldProps) {
  const [localOptions, setLocalOptions] = useState(options)
  const [newOption, setNewOption] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [state, formAction] = useActionState(updateOptionsAction, { error: undefined, success: false })

  const addOption = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOption.trim()) return
    
    const updatedOptions = [...localOptions, newOption.trim()]
    setLocalOptions(updatedOptions)
    setNewOption('')
    setShowInput(false)
    onChange(newOption.trim())
    
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
    <div className="space-y-1">
      <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">{label}</p>
      
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-[#030305] border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
        >
          {localOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        
        <button
          type="button"
          onClick={() => setShowInput(!showInput)}
          className="px-2 py-2 border border-white/20 text-white/50 hover:border-[#DFFF00] hover:text-[#DFFF00] text-xs"
        >
          +
        </button>
        
        {value && (
          <button
            type="button"
            onClick={() => removeOption(value)}
            className="px-2 py-2 border border-white/20 text-white/30 hover:text-red-400 text-xs"
          >
            ×
          </button>
        )}
      </div>

      {showInput && (
        <form onSubmit={addOption} className="flex gap-2 mt-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add new option..."
            autoFocus
            className="flex-1 bg-transparent border border-white/10 px-2 py-1 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newOption.trim()}
            className="px-3 py-1 bg-[#DFFF00] text-black text-xs font-medium hover:bg-[#d4ff00] disabled:opacity-30"
          >
            ADD
          </button>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="px-3 py-1 border border-white/20 text-white/50 text-xs hover:text-white"
          >
            CANCEL
          </button>
        </form>
      )}
    </div>
  )
}