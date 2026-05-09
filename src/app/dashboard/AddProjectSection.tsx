import { getOptions } from '@/lib/content'
import { AddProjectFormWrapper } from './AddProjectFormWrapper'

const defaultMotion = {
  statuses: ['Case Study', 'Prototype', 'Experiment', 'Showreel'],
  categories: ['Logo Animation', 'Title Sequence', 'Explainer Video', 'Motion Graphics', 'Visual Effects', 'Brand Film', 'Music Video', 'Social Media'],
  tools: ['After Effects', 'Cinema 4D', 'Blender', 'Premiere Pro', 'Illustrator', 'Photoshop', 'Houdini', 'Nuke']
}

const defaultCode = {
  statuses: ['Case Study', 'Prototype', 'Experiment', 'Learning Project'],
  categories: ['Web App', 'Website', 'Data Visualization', 'Tool', 'Interactive', 'Game', 'API/Backend', 'Machine Learning'],
  tools: ['React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Three.js', 'TensorFlow', 'PostgreSQL', 'MongoDB', 'Docker', 'Figma']
}

export default async function AddProjectSection() {
  const options = await getOptions()
  const opt = options ?? {}

  const normalizedOptions = {
    statuses: opt.statuses ?? [],
    categories: opt.categories ?? [],
    tools: opt.tools ?? [],
    disciplines: opt.disciplines ?? [],
    motion: {
      statuses: opt.motion?.statuses ?? defaultMotion.statuses,
      categories: opt.motion?.categories ?? defaultMotion.categories,
      tools: opt.motion?.tools ?? defaultMotion.tools
    },
    code: {
      statuses: opt.code?.statuses ?? defaultCode.statuses,
      categories: opt.code?.categories ?? defaultCode.categories,
      tools: opt.code?.tools ?? defaultCode.tools
    }
  }

  return <AddProjectFormWrapper options={normalizedOptions} />
}