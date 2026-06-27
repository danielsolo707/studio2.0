import { readFile } from 'fs/promises'
import path from 'path'
import { readContent } from '@/lib/cms/content'
import { listMessages } from '@/lib/contact/contact-log'

const promptPath = (fileName: string) => path.join(process.cwd(), 'src', 'agents', 'hermes', 'prompts', fileName)

async function readPrompt(fileName: string) {
  return readFile(promptPath(fileName), 'utf8')
}

export async function buildPublicHermesSystemPrompt() {
  const [systemPrompt, content] = await Promise.all([
    readPrompt('public-system.md'),
    readContent(),
  ])

  const projects = content.projects.slice(0, 12).map((project) => (
    `- ${project.name} (${project.year}): ${project.category}; tools: ${project.tools}; summary: ${project.subtitle || project.description}`
  )).join('\n')

  return `${systemPrompt}

Portfolio context:
Hero: ${content.hero?.headline || 'Creative Developer'}
Hero description: ${content.hero?.description || ''}
About: ${content.about.body}
Skills: ${content.about.skills.join(', ')}

Selected projects:
${projects}`
}

export async function buildAdminHermesSystemPrompt() {
  const [systemPrompt, content, messages] = await Promise.all([
    readPrompt('admin-system.md'),
    readContent(),
    listMessages(10),
  ])

  const projectSummary = content.projects.map((project) => (
    `- ${project.id}: ${project.name} (${project.discipline || 'motion'}, ${project.status || 'case-study'})`
  )).join('\n')

  const messageSummary = messages.map((message) => (
    `- ${message.name} <${message.email}>: ${message.message.slice(0, 220)}`
  )).join('\n')

  return `${systemPrompt}

Dashboard context:
Project count: ${content.projects.length}
Projects:
${projectSummary}

Recent contact messages:
${messageSummary || 'No recent messages.'}`
}

