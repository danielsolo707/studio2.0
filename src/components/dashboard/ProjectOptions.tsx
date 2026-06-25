import { getOptions } from '@/lib/content'
import { EditableSelect } from './EditableSelect'

export async function ProjectOptions() {
  const options = await getOptions()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="border border-white/10 p-3">
        <EditableSelect
          label="STATUS"
          name="statuses"
          options={options?.statuses ?? []}
        />
      </div>
      <div className="border border-white/10 p-3">
        <EditableSelect
          label="CATEGORY"
          name="categories"
          options={options?.categories ?? []}
        />
      </div>
      <div className="border border-white/10 p-3">
        <EditableSelect
          label="TOOLS"
          name="tools"
          options={options?.tools ?? []}
        />
      </div>
      <div className="border border-white/10 p-3">
        <EditableSelect
          label="DISCIPLINE"
          name="disciplines"
          options={options?.disciplines ?? []}
        />
      </div>
      <div className="border border-white/10 p-3 md:col-span-2">
        <EditableSelect
          label="LINK TYPES"
          name="linkTypes"
          options={options?.linkTypes ?? []}
        />
      </div>
    </div>
  )
}