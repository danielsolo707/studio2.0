"use client"

import React from 'react'

interface MarkdownRendererProps {
  content: string
}

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let rest = text
  let key = 0

  const pushText = (chunk: string) => {
    nodes.push(chunk)
  }

  while (rest.length > 0) {
    let matched = false

    const bold = /^\*\*([^*]+)\*\*/.exec(rest)
    if (bold) {
      nodes.push(<strong key={`${keyPrefix}-${key++}`}>{bold[1]}</strong>)
      rest = rest.slice(bold[0].length)
      continue
    }

    const code = /^`([^`]+)`/.exec(rest)
    if (code) {
      nodes.push(<code key={`${keyPrefix}-${key++}`} className="px-1 py-0.5 bg-white/10 rounded text-[#DFFF00]">{code[1]}</code>)
      rest = rest.slice(code[0].length)
      continue
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)/.exec(rest)
    if (link) {
      const href = link[2].trim()
      // Only allow safe URL schemes; otherwise render the raw text.
      if (/^(https?:\/\/|mailto:)/i.test(href)) {
        nodes.push(
          <a
            key={`${keyPrefix}-${key++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {link[1]}
          </a>,
        )
        rest = rest.slice(link[0].length)
        continue
      }
    }

    const italic = /^\*([^*]+)\*/.exec(rest)
    if (italic) {
      nodes.push(<em key={`${keyPrefix}-${key++}`}>{italic[1]}</em>)
      rest = rest.slice(italic[0].length)
      continue
    }

    // No pattern matched at this position; emit text up to the next special char.
    const nextSpecial = rest.search(/[`*\[]/)
    if (nextSpecial === -1) {
      pushText(rest)
      break
    }
    if (nextSpecial === 0) {
      pushText(rest[0])
      rest = rest.slice(1)
    } else {
      pushText(rest.slice(0, nextSpecial))
      rest = rest.slice(nextSpecial)
    }
  }

  return nodes
}

function renderBlocks(content: string): React.ReactNode[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i += 1
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push(
        <p key={key++} className="mb-2">
          <strong>{parseInline(heading[2], `h-${key}`)}</strong>
        </p>,
      )
      i += 1
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i += 1
      }
      blocks.push(
        <ul key={key++} className="list-disc ml-4 mb-2">
          {items.map((it, idx) => (
            <li key={idx}>{parseInline(it, `ul-${key}-${idx}`)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i += 1
      }
      blocks.push(
        <ol key={key++} className="list-decimal ml-4 mb-2">
          {items.map((it, idx) => (
            <li key={idx}>{parseInline(it, `ol-${key}-${idx}`)}</li>
          ))}
        </ol>,
      )
      continue
    }

    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i])
      i += 1
    }
    blocks.push(
      <p key={key++} className="mb-2">
        {parseInline(para.join(' '), `p-${key}`)}
      </p>,
    )
  }

  return blocks
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null

  return (
    <div className="[&_p]:text-white/70 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:text-white/70 [&_li]:mb-1 [&_a]:text-[#DFFF00] [&_a:hover]:underline [&_strong]:text-white [&_strong]:font-semibold [&_em]:text-white/80">
      {renderBlocks(content)}
    </div>
  )
}
