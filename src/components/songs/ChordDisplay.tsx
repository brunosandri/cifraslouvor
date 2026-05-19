'use client'

import { parseChordLine } from '@/lib/utils'

interface ChordDisplayProps {
  content: string
  className?: string
}

export function ChordDisplay({ content, className }: ChordDisplayProps) {
  const lines = content.split('\n')

  return (
    <div className={className} style={{ fontFamily: "'Courier New', monospace" }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-3" />
        const { text, chords } = parseChordLine(line)
        const hasChords = chords.length > 0

        if (!hasChords) {
          return (
            <div key={i} className="lyric-line">{text || ' '}</div>
          )
        }

        // Build chord row
        const chordRow = buildChordRow(text, chords)

        return (
          <div key={i} className="mb-0.5">
            <div className="chord-line whitespace-pre">{chordRow}</div>
            <div className="lyric-line whitespace-pre">{text || ' '}</div>
          </div>
        )
      })}
    </div>
  )
}

function buildChordRow(text: string, chords: { pos: number; chord: string }[]): string {
  let row = ''
  let cursor = 0
  for (const { pos, chord } of chords) {
    if (pos > cursor) {
      // pad spaces to reach position
      while (row.length < pos) row += ' '
    }
    row += chord
    cursor = row.length
  }
  return row || ' '
}
