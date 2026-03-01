/**
 * MentionsEngine - Parse and resolve @user mentions in notes and communications
 * Extracts @mentions from text for storage and highlights in display
 */

const MENTION_REGEX = /@(\w+(?:\.\w+)?)/g

export interface MentionMatch {
  full: string
  username: string
  start: number
  end: number
}

/** Extract all @mentions from text */
export function extractMentions(text: string | null | undefined): string[] {
  if (!text || typeof text !== 'string') return []
  const matches = [...text.matchAll(MENTION_REGEX)]
  const usernames = matches.map((m) => m[1] ?? '').filter(Boolean)
  return [...new Set(usernames)]
}

/** Parse text into segments (plain text and mentions) for rendering */
export function parseMentions(text: string | null | undefined): Array<{ type: 'text' | 'mention'; value: string }> {
  if (!text || typeof text !== 'string') return []
  const segments: Array<{ type: 'text' | 'mention'; value: string }> = []
  let lastIndex = 0

  for (const match of text.matchAll(MENTION_REGEX)) {
    const full = match[0] ?? ''
    const username = match[1] ?? ''
    const start = match.index ?? 0

    if (start > lastIndex) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex, start),
      })
    }
    segments.push({ type: 'mention', value: username })
    lastIndex = start + full.length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments
}
