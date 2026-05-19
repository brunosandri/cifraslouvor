import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export function parseChordLine(line: string): { text: string; chords: { pos: number; chord: string }[] } {
  const chords: { pos: number; chord: string }[] = []
  let cleanText = ''
  let i = 0
  while (i < line.length) {
    if (line[i] === '[') {
      const end = line.indexOf(']', i)
      if (end !== -1) {
        chords.push({ pos: cleanText.length, chord: line.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    cleanText += line[i]
    i++
  }
  return { text: cleanText, chords }
}

export function hasChords(content: string): boolean {
  return /\[.+?\]/.test(content)
}

export function extractChordsFromContent(content: string): string[] {
  const matches = content.match(/\[(.+?)\]/g) || []
  const unique = [...new Set(matches.map(m => m.slice(1, -1)))]
  return unique
}
