"use client"

import { useState, useActionState, startTransition } from 'react'
import { Check, Plus, X } from 'lucide-react'
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
    const trimmed = newOption.trim()
    if (!trimmed) return
    if (localOptions.includes(trimmed)) {
      setNewOption('')
      setShowInput(false)
      return
    }

    const updatedOptions = [...localOptions, trimmed]
    setLocalOptions(updatedOptions)
    setNewOption('')
    setShowInput(false)

    if (multiple) {
      onChange([...selectedValues, trimmed].join(','))
    } else {
      onChange(trimmed)
    }

    const formData = new FormData()
    formData.append(name, JSON.stringify(updatedOptions))
    startTransition(() => formAction(formData))
  }

  const removeOption = (optionToRemove: string) => {
    const updatedOptions = localOptions.filter(o => o !== optionToRemove)
    setLocalOptions(updatedOptions)

    if (multiple) {
      const updated = selectedValues.filter(v => v !== optionToRemove)
      onChange(updated.join(','))
    } else if (value === optionToRemove) {
      onChange('')
    }

    const formData = new FormData()
    formData.append(name, JSON.stringify(updatedOptions))
    startTransition(() => formAction(formData))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const selected = e.target.value
      if (selected && !selectedValues.includes(selected)) {
        onChange([...selectedValues, selected].join(','))
      }
    } else {
      onChange(e.target.value)
    }
  }

  const removeSelected = (opt: string) => {
    const updated = selectedValues.filter(v => v !== opt)
    onChange(updated.join(','))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] tracking-[0.28em] text-[#DFFF00]">{label}</p>
        {multiple && selectedValues.length > 0 && (
          <span className="rounded-full border border-[#DFFF00]/20 bg-[#DFFF00]/10 px-2 py-0.5 text-[10px] text-[#DFFF00]">
            {selectedValues.length} selected
          </span>
        )}
      </div>

      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="group relative">
            <select
              value={multiple ? '' : value}
              onChange={handleSelectChange}
              className="h-11 w-full appearance-none rounded-md border border-white/10 bg-[#060608] px-3 pr-9 text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors hover:border-white/25 focus:border-[#DFFF00]/70 focus:bg-[#09090b]"
            >
              {multiple && (
                <option value="" disabled>
                  {selectedValues.length > 0 ? 'Add another tool...' : 'Select tools...'}
                </option>
              )}
              {localOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/35 transition-colors group-focus-within:text-[#DFFF00]">
              v
            </span>
          </div>

          {multiple && selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedValues.map(v => (
                <span
                  key={v}
                  className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] text-white/85"
                >
                  <Check size={11} className="text-[#DFFF00]" aria-hidden="true" />
                  <span>{v}</span>
                  <button
                    type="button"
                    onClick={() => removeSelected(v)}
                    className="rounded-full p-0.5 text-white/35 transition-colors hover:bg-red-500/15 hover:text-red-300"
                    aria-label={`Remove ${v}`}
                  >
                    <X size={11} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowInput(!showInput)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-white/55 transition-colors hover:border-[#DFFF00]/60 hover:bg-[#DFFF00]/10 hover:text-[#DFFF00]"
          aria-label={`Add ${label.toLowerCase()} option`}
        >
          <Plus size={15} aria-hidden="true" />
        </button>

        {!multiple && value && (
          <button
            type="button"
            onClick={() => removeOption(value)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-white/35 transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
            aria-label={`Remove ${value}`}
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {showInput && (
        <div className="flex gap-2 rounded-md border border-white/10 bg-white/[0.03] p-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
            placeholder="Add new option..."
            autoFocus
            className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-2.5 py-2 text-xs outline-none transition-colors focus:border-[#DFFF00]/60"
          />
          <button
            type="button"
            onClick={addOption}
            disabled={!newOption.trim()}
            className="rounded bg-[#DFFF00] px-3 py-2 text-xs font-medium text-black transition-colors hover:bg-[#d4ff00] disabled:opacity-30"
          >
            ADD
          </button>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="rounded border border-white/15 px-3 py-2 text-xs text-white/50 transition-colors hover:border-white/30 hover:text-white"
          >
            CANCEL
          </button>
        </div>
      )}

      {state?.error && (
        <p className="text-[10px] text-red-400 mt-1">{state.error}</p>
      )}
    </div>
  )
}
