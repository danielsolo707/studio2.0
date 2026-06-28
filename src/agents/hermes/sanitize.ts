const PUBLIC_SAFE_FALLBACK =
  "I'm not able to share that. Ask me about the work on the site, or use the contact form to reach Daniel directly."

// After replacement pass, check if any bracketed placeholder still exists
// in the text — this means the AI leaked something that we had to redact.
// In that case, return the fallback instead of showing broken/hint-filled text.
function hasRedactionBrackets(text: string): boolean {
  return /\[.*?\]/.test(text)
}

/**
 * Only patterns tied to Daniel's specific personal/infra info.
 * Generic words (API, backend, automation) are NOT replaced to avoid
 * false positives on normal project descriptions.
 */
const SENSITIVE_REPLACEMENTS: { regex: RegExp; replacement: string }[] = [
  // IP addresses (with optional port)
  { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?\b/g, replacement: '[redacted]' },
  // Full legal name — Latin
  { regex: /\bDaniel\s+Soleimani\b/gi, replacement: 'Daniel' },
  // Full legal name — Persian script (دانیال سلیمانی)
  { regex: /دانیال\s+سلیمانی/gi, replacement: 'دانیال' },
  // Portfolio domain
  { regex: /\b(?:www\.)?danielsoleimani\.ir\b/gi, replacement: '[portfolio domain]' },
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
  // Persian: "مدیریت سایت" (site management)
  { regex: /مدیریت\s+سایت/gi, replacement: '[site ops]' },
  // English: "site management"
  { regex: /\bsite\s+management\b/gi, replacement: '[site ops]' },
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

  // If ANY bracket placeholder remains, the AI leaked enough to need
  // redaction. Return the safe fallback to avoid hint-filled text.
  if (hasRedactionBrackets(sanitized)) {
    return PUBLIC_SAFE_FALLBACK
  }

  // If the entire message was sensitive, return the safe fallback.
  const onlyRedactions = /^\s*(\[.*?\][\s,]*)*\s*$/.test(sanitized)
  if (!sanitized || onlyRedactions) {
    return PUBLIC_SAFE_FALLBACK
  }

  return sanitized
}
