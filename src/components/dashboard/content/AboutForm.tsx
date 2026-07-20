"use client"

import { useActionState } from 'react';
import { updateAboutAction } from '@/app/dashboard/actions';
import { SubmitButton } from '@/components/forms/SubmitButton';

const initialState = { error: undefined as string | undefined };

export function AboutForm({ initialData }: {
  initialData: {
    label: string;
    headline: string;
    body: string;
    skills: string[];
  };
}) {
  const [state, formAction] = useActionState(updateAboutAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">LABEL</label>
        <input
          name="label"
          defaultValue={initialData.label}
          className="w-full bg-transparent border border-white/10 px-4 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">HEADLINE</label>
        <input
          name="headline"
          defaultValue={initialData.headline}
          className="w-full bg-transparent border border-white/10 px-4 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">BODY</label>
        <textarea
          name="body"
          defaultValue={initialData.body}
          rows={5}
          className="w-full bg-transparent border border-white/10 px-4 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.3em] text-white/60 font-headline">SKILLS (comma separated)</label>
        <input
          name="skills"
          defaultValue={initialData.skills.join(', ')}
          className="w-full bg-transparent border border-white/10 px-4 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
        />
      </div>
      <SubmitButton>UPDATE ABOUT</SubmitButton>
      {state?.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-xs text-[#DFFF00]">Updated successfully!</p>
      )}
    </form>
  );
}