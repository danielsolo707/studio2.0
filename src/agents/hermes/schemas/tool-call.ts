import type { HermesToolCall } from '../tools/types'

export type ParsedHermesContent = {
  text: string
  toolCalls: HermesToolCall[]
}

const toolCallRegex = /<toolcall>\s*<name>([^<]+)<\/name>\s*<params>([\s\S]*?)<\/params>\s*<\/toolcall>/g
const paramRegex = /<param name="([^"]+)">([\s\S]*?)<\/param>/g

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function parseToolCallXml(matchText: string): HermesToolCall | null {
  const nameMatch = /<name>([^<]+)<\/name>/.exec(matchText)
  if (!nameMatch) return null
  const tool = nameMatch[1].trim()

  const params: Record<string, unknown> = {}
  const paramBlockMatch = /<params>([\s\S]*?)<\/params>/.exec(matchText)
  if (paramBlockMatch) {
    const block = paramBlockMatch[1]
    let paramMatch: RegExpExecArray | null
    const localRegex = new RegExp(paramRegex.source, paramRegex.flags)
    while ((paramMatch = localRegex.exec(block)) !== null) {
      const key = paramMatch[1].trim()
      const rawValue = decodeXmlEntities(paramMatch[2].trim())
      params[key] = rawValue
    }
  }

  return { tool, params }
}

function parseToolCallJsonBlock(text: string): HermesToolCall | null {
  try {
    const parsed = JSON.parse(text.trim())
    if (parsed && typeof parsed === 'object' && typeof parsed.tool === 'string') {
      return {
        tool: parsed.tool,
        params: parsed.params && typeof parsed.params === 'object' ? parsed.params : {},
      }
    }
  } catch {
    // ignore
  }
  return null
}

export function parseHermesToolCalls(content: string): ParsedHermesContent {
  const toolCalls: HermesToolCall[] = []
  let text = content

  // Parse explicit <toolcall>...</toolcall> blocks.
  let match: RegExpExecArray | null
  while ((match = toolCallRegex.exec(content)) !== null) {
    const parsed = parseToolCallXml(match[0])
    if (parsed) toolCalls.push(parsed)
  }

  if (toolCalls.length > 0) {
    text = content.replace(toolCallRegex, '').trim()
    return { text, toolCalls }
  }

  // Fallback: look for a fenced JSON tool call.
  const jsonBlockMatch = /```json\s*([\s\S]*?)```/.exec(content)
  if (jsonBlockMatch) {
    const parsed = parseToolCallJsonBlock(jsonBlockMatch[1])
    if (parsed) {
      toolCalls.push(parsed)
      text = content.replace(jsonBlockMatch[0], '').trim()
      return { text, toolCalls }
    }
  }

  // Fallback: the whole content might be a JSON tool call.
  const parsed = parseToolCallJsonBlock(content)
  if (parsed) {
    toolCalls.push(parsed)
    text = ''
  }

  return { text, toolCalls }
}

export function formatToolsPrompt(): string {
  return `You may use tools by outputting exactly one or more XML blocks like this:

<toolcall>
  <name>TOOL_NAME</name>
  <params>
    <param name="param1">value1</param>
    <param name="param2">value2</param>
  </params>
</toolcall>

Available tools:

<tool name="draft_email_reply">
  <param name="messageId">id of the contact message</param>
  <param name="subject">reply subject</param>
  <param name="body">full plain-text body</param>
  <param name="tone">optional: professional | friendly | brief</param>
</tool>

<tool name="create_project_draft">
  <param name="id">url-friendly slug</param>
  <param name="name">project display name</param>
  <param name="year">e.g. 2025</param>
  <param name="category">category label</param>
  <param name="discipline">motion | code | data | hybrid</param>
  <param name="status">case-study | prototype | experiment | learning-project | showreel | development</param>
  <param name="tools">comma-separated tools</param>
  <param name="description">short description</param>
  <param name="subtitle">optional one-liner</param>
  <param name="role">optional role</param>
  <param name="objective">optional objective</param>
  <param name="approach">optional approach</param>
  <param name="outcome">optional outcome</param>
  <param name="nextStep">optional next step</param>
</tool>

<tool name="update_project_draft">
  <param name="projectId">existing project id/slug</param>
  <param name="updates">JSON object with fields to change</param>
</tool>

<tool name="reorder_media_draft">
  <param name="projectId">existing project id/slug</param>
  <param name="order">JSON array of media URLs in desired order</param>
</tool>

<tool name="add_project_link_draft">
  <param name="projectId">existing project id/slug</param>
  <param name="label">link label</param>
  <param name="url">link URL</param>
  <param name="type">github | demo | notebook | video | kaggle</param>
</tool>

<tool name="mark_message_read">
  <param name="messageId">id of the contact message</param>
</tool>

<tool name="update_site_copy_draft">
  <param name="section">hero | about</param>
  <param name="updates">JSON object with fields to change</param>
</tool>

Rules:
- Only use tools when the user asks you to change something, draft a reply, or plan a project.
- For any write or destructive action, output the tool call and then wait for the user to confirm. Do not say the action is already done.
- For low-risk actions like mark_message_read, you may apply immediately and tell the user it is done.
- If a value contains XML characters, escape them as &lt; &gt; &amp;.
- Keep the conversational text short and practical.`
}
