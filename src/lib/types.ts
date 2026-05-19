export type SectionType =
  | 'intro'
  | 'verse'
  | 'verse1'
  | 'verse2'
  | 'verse3'
  | 'verse4'
  | 'chorus'
  | 'pre-chorus'
  | 'bridge'
  | 'instrumental'
  | 'outro'
  | 'other'

export const SECTION_LABELS: Record<SectionType, string> = {
  intro: 'Introdução',
  verse: 'Verso',
  verse1: 'Verso 1',
  verse2: 'Verso 2',
  verse3: 'Verso 3',
  verse4: 'Verso 4',
  chorus: 'Refrão',
  'pre-chorus': 'Pré-refrão',
  bridge: 'Ponte',
  instrumental: 'Instrumental',
  outro: 'Final',
  other: 'Outro',
}

export const SECTION_COLORS: Record<SectionType, string> = {
  intro: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  verse: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  verse1: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  verse2: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
  verse3: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  verse4: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400',
  chorus: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  'pre-chorus': 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  bridge: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  instrumental: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  outro: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  other: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
}

export const MUSICAL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
]

export interface Song {
  id: string
  title: string
  artist: string | null
  key: string | null
  bpm: number | null
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
  sections?: SongSection[]
  audio_files?: AudioFile[]
}

export interface SongSection {
  id: string
  song_id: string
  type: SectionType
  title: string
  observation: string | null
  content: string
  order_index: number
}

export interface AudioFile {
  id: string
  song_id: string
  file_url: string
  file_name: string
  description: string | null
  duration: number | null
  created_at: string
}

export interface SongFormData {
  title: string
  artist: string
  key: string
  bpm: string
  tags: string
  notes: string
}

export interface SectionFormData {
  type: SectionType
  title: string
  observation: string
  content: string
}
