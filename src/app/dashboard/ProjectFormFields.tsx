"use client"

import { useState } from 'react'
import { EditableSelectField } from './EditableSelectField'

type FormFieldsProps = {
  options: {
    statuses: string[]
    categories: string[]
    tools: string[]
    disciplines: string[]
    linkTypes: string[]
  }
  defaults: {
    status: string
    category: string
    tools: string
    discipline: string
  }
  fieldStates: {
    status: string
    category: string
    tools: string
    discipline: string
  }
  onFieldChange: (field: string, value: string) => void
}

export function ProjectFormFields({ options, defaults, fieldStates, onFieldChange }: FormFieldsProps) {
  return (
    <>
      <div>
        <EditableSelectField
          label="STATUS"
          name="statuses"
          options={options.statuses}
          value={fieldStates.status}
          onChange={(value) => onFieldChange('status', value)}
        />
      </div>
      
      <div>
        <EditableSelectField
          label="CATEGORY"
          name="categories"
          options={options.categories}
          value={fieldStates.category}
          onChange={(value) => onFieldChange('category', value)}
        />
      </div>
      
      <div>
        <EditableSelectField
          label="TOOLS"
          name="tools"
          options={options.tools}
          value={fieldStates.tools}
          onChange={(value) => onFieldChange('tools', value)}
        />
      </div>
      
      <div>
        <EditableSelectField
          label="DISCIPLINE"
          name="disciplines"
          options={options.disciplines}
          value={fieldStates.discipline}
          onChange={(value) => onFieldChange('discipline', value)}
        />
      </div>
    </>
  )
}