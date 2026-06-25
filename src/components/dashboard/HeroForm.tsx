"use client"

import { useActionState } from 'react';
import { updateHeroAction } from '@/app/dashboard/actions';
import { SubmitButton } from '@/components/SubmitButton';

const initialState = { error: undefined as string | undefined };

export function HeroForm({ initialData }: {
  initialData: {
    headline: string;
    description: string;
  };
}) {
  const [state, formAction] = useActionState(updateHeroAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">HEADLINE</label>
        <input
          name="headline"
          defaultValue={initialData.headline}
          className="w-full bg-transparent border border-white/10 px-4 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">DESCRIPTION</label>
        <textarea
          name="description"
          defaultValue={initialData.description}
          rows={4}
          className="w-full bg-transparent border border-white/10 px-4 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
        />
      </div>
      <SubmitButton>UPDATE HERO</SubmitButton>
      {state?.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
      {state?.error === null && (
        <p className="text-xs text-[#DFFF00]">Updated successfully!</p>
      )}
    </form>
  );
}