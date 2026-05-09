"use client"

import { useState } from 'react'
import { AddMotionProjectForm } from './AddMotionProjectForm'
import { AddCodeProjectForm } from './AddCodeProjectForm'

type DisciplineOptions = {
  statuses: string[]
  categories: string[]
  tools: string[]
}

type Options = {
  statuses: string[]
  categories: string[]
  tools: string[]
  disciplines: string[]
  motion: DisciplineOptions
  code: DisciplineOptions
}

const defaultOptions: Options = {
  statuses: [],
  categories: [],
  tools: [],
  disciplines: [],
  motion: {
    statuses: ['Case Study', 'Prototype', 'Experiment', 'Showreel'],
    categories: ['Logo Animation', 'Title Sequence', 'Explainer Video', 'Motion Graphics', 'Visual Effects', 'Brand Film', 'Music Video', 'Social Media'],
    tools: ['After Effects', 'Cinema 4D', 'Blender', 'Premiere Pro', 'Illustrator', 'Photoshop', 'Houdini', 'Nuke']
  },
  code: {
    statuses: ['Case Study', 'Prototype', 'Experiment', 'Learning Project'],
    categories: ['Web App', 'Website', 'Data Visualization', 'Tool', 'Interactive', 'Game', 'API/Backend', 'Machine Learning'],
    tools: ['React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Three.js', 'TensorFlow', 'PostgreSQL', 'MongoDB', 'Docker', 'Figma']
  }
}

export function AddProjectFormWrapper({ options }: { options?: Options }) {
  const [activeForm, setActiveForm] = useState<'motion' | 'code'>('motion')
  const opts = options ?? defaultOptions

  return (
    <div className="space-y-6">
      {/* Form Type Selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveForm('motion')}
          className={`px-4 py-2 font-headline text-[10px] tracking-[0.2em] border transition-colors ${
            activeForm === 'motion'
              ? 'border-[#DFFF00] bg-[#DFFF00] text-black'
              : 'border-white/20 text-white/50 hover:border-[#DFFF00]/50 hover:text-[#DFFF00]'
          }`}
        >
          MOTION PROJECTS
        </button>
        <button
          type="button"
          onClick={() => setActiveForm('code')}
          className={`px-4 py-2 font-headline text-[10px] tracking-[0.2em] border transition-colors ${
            activeForm === 'code'
              ? 'border-[#DFFF00] bg-[#DFFF00] text-black'
              : 'border-white/20 text-white/50 hover:border-[#DFFF00]/50 hover:text-[#DFFF00]'
          }`}
        >
          CODE PROJECTS
        </button>
      </div>

      {/* Forms */}
      <div className="border border-white/10 p-6 bg-black/30 rounded-lg">
        {activeForm === 'motion' ? (
          <AddMotionProjectForm options={opts.motion} />
        ) : (
          <AddCodeProjectForm options={opts.code} />
        )}
      </div>
    </div>
  )
}