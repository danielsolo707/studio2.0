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
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-white/40 mb-2">BASIC INFO</p>
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">SLUG (URL)</p>
        <input 
          name="id" 
          placeholder="my-project"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">PROJECT NAME</p>
        <input 
          name="name" 
          placeholder="My Project"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">YEAR</p>
        <input 
          name="year" 
          placeholder="2024"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">CATEGORY</p>
        <input 
          name="category" 
          placeholder="Motion Design"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">DISCIPLINE</p>
        <select
          name="discipline"
          defaultValue="motion"
          className="w-full bg-[#030305] border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
        >
          {DISCIPLINE_OPTIONS.map((option) => (
            <option key={option} value={option}>{DISCIPLINE_LABELS[option]}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">STATUS</p>
        <select
          name="status"
          defaultValue="prototype"
          className="w-full bg-[#030305] border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>{STATUS_LABELS[option]}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">TOOLS</p>
        <input 
          name="tools" 
          placeholder="After Effects, Cinema 4D"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">ACCENT COLOR</p>
        <input 
          name="color" 
          placeholder="#DFFF00"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">MAIN IMAGE URL</p>
        <input 
          name="imageUrl" 
          placeholder="https://example.com/image.jpg"
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">VIDEO URL (OPTIONAL)</p>
        <input 
          name="videoUrl" 
          placeholder="https://youtube.com/..."
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] tracking-[0.3em] text-[#DFFF00] mb-2">DESCRIPTION</p>
        <textarea 
          name="description" 
          placeholder="Enter project details. Use titles like 'Objective:', 'Approach:', 'Outcome:', 'Next Step:' to organize your content."
          rows={10} 
          className="w-full bg-transparent border border-white/10 px-3 py-2 focus:border-[#DFFF00]/50 focus:outline-none font-body text-sm" 
        />
      </div>
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
