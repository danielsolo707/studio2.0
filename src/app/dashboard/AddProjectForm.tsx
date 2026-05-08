"use client"

import { useActionState } from 'react';
import { addProjectAction } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import {
  DISCIPLINE_LABELS,
  DISCIPLINE_OPTIONS,
  LINK_TYPE_LABELS,
  LINK_TYPE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '@/lib/project-meta';

const initialState = { error: undefined as string | undefined };

export function AddProjectForm() {
  const [state, formAction] = useActionState(addProjectAction, initialState);

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
      <select
        name="discipline"
        defaultValue="motion"
        className="bg-[#030305] border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
      >
        {DISCIPLINE_OPTIONS.map((option) => (
          <option key={option} value={option}>{DISCIPLINE_LABELS[option]}</option>
        ))}
      </select>
      <select
        name="status"
        defaultValue="prototype"
        className="bg-[#030305] border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>{STATUS_LABELS[option]}</option>
        ))}
      </select>
      <input
        name="role"
        placeholder="role (e.g. Creative Developer)"
        className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2 focus:border-[#DFFF00]/50 focus:outline-none"
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
      <textarea
        name="objective"
        placeholder="objective / problem"
        rows={2}
        className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2 focus:border-[#DFFF00]/50 focus:outline-none"
      />
      <textarea
        name="approach"
        placeholder="approach / process"
        rows={2}
        className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2 focus:border-[#DFFF00]/50 focus:outline-none"
      />
      <textarea
        name="outcome"
        placeholder="outcome / result"
        rows={2}
        className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2 focus:border-[#DFFF00]/50 focus:outline-none"
      />
      <textarea
        name="nextStep"
        placeholder="next step / what I would improve"
        rows={2}
        className="bg-transparent border border-white/10 px-3 py-2 md:col-span-2 focus:border-[#DFFF00]/50 focus:outline-none"
      />
      <div className="md:col-span-2 grid gap-3 border border-white/10 p-3">
        <p className="font-headline text-[10px] tracking-[0.3em] text-white/50">
          PROJECT LINKS
        </p>
        {[0, 1, 2].map((index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_160px]">
            <input
              name={`linkLabel${index}`}
              placeholder="label"
              className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
            />
            <input
              name={`linkUrl${index}`}
              placeholder="https://"
              className="bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
            />
            <select
              name={`linkType${index}`}
              defaultValue="demo"
              className="bg-[#030305] border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
            >
              {LINK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{LINK_TYPE_LABELS[option]}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <SubmitButton>ADD</SubmitButton>
      {state?.error && (
        <p className="text-xs text-red-400 md:col-span-2">{state.error}</p>
      )}
    </form>
  );
}
