"use client"

import { useState, useActionState, startTransition } from 'react'
import { updateOptionsAction } from '@/app/dashboard/actions'

type FieldProps = {
  label: string
  name: 'statuses' | 'categories' | 'tools' | 'disciplines' | 'linkTypes'
  options: string[]
  value: string
  onChange: (value: string) => void
  multiple?: boolean
}

export function EditableSelectField({ label, name, options, value, onChange, multiple }: FieldProps) {
  const [localOptions, setLocalOptions] = useState(options)
  const [newOption, setNewOption] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [state, formAction] = useActionState(updateOptionsAction, { error: undefined, success: false })

  const selectedValues = value ? (multiple ? value.split(',').map(s => s.trim()).filter(Boolean) : [value]) : []

  const addOption = () => {
    if (!newOption.trim()) return
    
    const updatedOptions = [...localOptions, newOption.trim()]
    setLocalOptions(updatedOptions)
    setNewOption('')
    setShowInput(false)
    onChange(newOption.trim())
    
    const formData = new FormData()
    formData.append(name, JSON.stringify(updatedOptions))
    startTransition(() => formAction(formData))
  }

  const removeOption = (optionToRemove: string) => {
    const updatedOptions = localOptions.filter(o => o !== optionToRemove)
    setLocalOptions(updatedOptions)
    
    const formData = new FormData()
    formData.append(name, JSON.stringify(updatedOptions))
    startTransition(() => formAction(formData))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const selected = Array.from(e.target.selectedOptions).map(o => o.value)
      onChange(selected.join(','))
    } else {
      onChange(e.target.value)
    }
  }

  const removeSelected = (opt: string) => {
    const updated = selectedValues.filter(v => v !== opt)
    onChange(updated.join(','))
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">{label}</p>
      
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-1">
          <select
            value={multiple ? selectedValues : value}
            onChange={handleSelectChange}
            multiple={multiple}
            size={multiple ? 4 : undefined}
            className="w-full bg-[#030305] border border-white/10 px-3 py-2 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
          >
            {localOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          {multiple && selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedValues.map(v => (
                <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 text-[10px]">
                  {v}
                  <button type="button" onClick={() => removeSelected(v)} className="text-white/30 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setShowInput(!showInput)}
          className="px-2 py-2 border border-white/20 text-white/50 hover:border-[#DFFF00] hover:text-[#DFFF00] text-xs shrink-0"
        >
          +
        </button>

        {!multiple && value && (
          <button
            type="button"
            onClick={() => removeOption(value)}
            className="px-2 py-2 border border-white/20 text-white/30 hover:text-red-400 text-xs shrink-0"
          >
            ×
          </button>
        )}
      </div>

      {showInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
            placeholder="Add new option..."
            autoFocus
            className="flex-1 bg-transparent border border-white/10 px-2 py-1 text-xs focus:border-[#DFFF00]/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={addOption}
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
        </div>
      )}
    </div>
  )
}
