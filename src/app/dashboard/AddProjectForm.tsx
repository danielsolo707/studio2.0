"use client"

import { useActionState } from 'react';
import { addProjectAction } from './actions';
import { SubmitButton } from '@/components/SubmitButton';

const initialState = { error: undefined as string | undefined };

export function AddProjectForm() {
  const [state, formAction, isPending] = useActionState(addProjectAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <input 
        name="id" 
        placeholder="slug (e.g. my-project)" 
        className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <input 
        name="name" 
        placeholder="name" 
        className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <input 
        name="year" 
        placeholder="year" 
        className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <input 
        name="category" 
        placeholder="category" 
        className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <input 
        name="tools" 
        placeholder="tools" 
        className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <input 
        name="color" 
        placeholder="#DFFF00" 
        className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <input 
        name="imageUrl" 
        placeholder="image URL" 
        className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <input 
        name="videoUrl" 
        placeholder="video URL (optional)" 
        className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <textarea 
        name="description" 
        placeholder="description" 
        rows={3} 
        className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2 focus:border-[#DFFF00]/50 focus:outline-none" 
      />
      <SubmitButton>ADD</SubmitButton>
      {state?.error && (
        <p className="text-xs text-red-400 md:col-span-2">{state.error}</p>
      )}
    </form>
  );
}