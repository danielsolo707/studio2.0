const PUBLIC_SAFE_FALLBACK =
  "I'm not able to share that. Ask me about the work on the site, or use the contact form to reach Daniel directly."

const SENSITIVE_REPLACEMENTS: { regex: RegExp; replacement: string }[] = [
  // IP addresses (with optional port)
  { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?\b/g, replacement: '[redacted]' },
  // Portfolio domain
  { regex: /\b(?:www\.)?danielsoleimani\.ir\b/gi, replacement: '[portfolio site]' },
  // Full legal name
  { regex: /\bDaniel\s+Soleimani\b/gi, replacement: 'Daniel' },
  // Internal system names
  { regex: /\bHermes(?:\s+(?:Agent|Remote))?\b/gi, replacement: '[internal system]' },
  { regex: /\bTelegram(?:\s+gateway)?\b/gi, replacement: '[notification service]' },
  { regex: /\bPortfolio\s+API\b/gi, replacement: '[backend service]' },
  { regex: /\bFastAPI\b/gi, replacement: '[backend framework]' },
  // Infrastructure details
  { regex: /\bVPS\b/gi, replacement: '[host]' },
  { regex: /\bport\s+5050\b/gi, replacement: '[service port]' },
  // Location / country
  { regex: /\b(?:based in|located in|from)\s+(?:Iran|Tehran)\b/gi, replacement: '[location]' },
  { regex: /\bIran(?:ian)?\b/gi, replacement: '[country]' },
  // Email addresses
  { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[email]' },
]

export function sanitizePublicHermesResponse(text: string): string {
  if (!text || typeof text !== 'string') {
    return PUBLIC_SAFE_FALLBACK
  }

  let sanitized = text

  for (const { regex, replacement } of SENSITIVE_REPLACEMENTS) {
    sanitized = sanitized.replace(regex, replacement)
  }

  sanitized = sanitized.trim()

  // If the entire message was sensitive, return the safe fallback instead of a
  // string full of redaction placeholders.
  const onlyRedactions = /^\s*(\[.*?\][\s,]*)*\s*$/.test(sanitized)
  if (!sanitized || onlyRedactions) {
    return PUBLIC_SAFE_FALLBACK
  }

  return sanitized
}
