"use client"

import { useActionState } from 'react'
import { updateAiConfigAction } from '@/app/dashboard/hermes/actions'
import type { AiConfigState } from '@/app/dashboard/hermes/actions'

type AiConfigFormProps = {
  initialPublicModel: string
  initialAdminModel: string
  hasApiKey: boolean
}

const initialState: AiConfigState = {}

export function AiConfigForm({
  initialPublicModel,
  initialAdminModel,
  hasApiKey,
}: AiConfigFormProps) {
  const [state, formAction, isPending] = useActionState(updateAiConfigAction, initialState)

  const inputClass =
    'block box-border w-full bg-transparent border border-white/10 px-4 py-3 text-white font-body text-sm focus:border-[#DFFF00]/50 focus:outline-none'
  const labelClass =
    'text-[10px] tracking-[0.3em] text-white/60 font-headline'

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="ai-public-model" className={labelClass}>
          PUBLIC MODEL
        </label>
        <input
          id="ai-public-model"
          name="publicModel"
          type="text"
          defaultValue={initialPublicModel}
          placeholder="e.g. poolside/laguna-xs-2.1:free"
          className={inputClass}
          required
        />
        <p className="text-[10px] text-white/35 font-body">
          Model used by visitors on the public landing page.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="ai-admin-model" className={labelClass}>
          ADMIN MODEL
        </label>
        <input
          id="ai-admin-model"
          name="adminModel"
          type="text"
          defaultValue={initialAdminModel}
          placeholder="e.g. poolside/laguna-xs-2.1:free"
          className={inputClass}
          required
        />
        <p className="text-[10px] text-white/35 font-body">
          Model used in this dashboard chat (can be stronger/different).
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="ai-api-key" className={labelClass}>
          API KEY {hasApiKey && <span className="text-[#DFFF00]">(SET)</span>}
        </label>
        <input
          id="ai-api-key"
          name="apiKey"
          type="password"
          placeholder={hasApiKey ? '•••••••• (leave blank to keep current)' : 'nvapi-...'}
          className={inputClass}
          autoComplete="off"
        />
        <p className="text-[10px] text-white/35 font-body">
          NVIDIA NIM API key. Encrypted (AES-256-GCM) before storage. Leave blank to keep existing.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] disabled:opacity-60 hover:bg-[#d4ff00] transition-colors"
      >
        {isPending ? 'SAVING...' : 'SAVE CONFIG'}
      </button>

      {state.error && (
        <p className="text-xs text-red-400 font-body" role="status">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-xs text-[#DFFF00] font-body" role="status">
          AI configuration saved.
        </p>
      )}
    </form>
  )
}
