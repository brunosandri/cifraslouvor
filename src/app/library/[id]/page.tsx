'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Music2, Expand } from 'lucide-react'
import { getSong } from '@/lib/db'
import type { Song, SongSection } from '@/lib/types'
import { SECTION_LABELS, SECTION_COLORS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { ChordDisplay } from '@/components/songs/ChordDisplay'
import { AudioPlayer } from '@/components/songs/AudioPlayer'
import { PresentationMode } from '@/components/songs/PresentationMode'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function LibrarySongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [song, setSong] = useState<Song | null>(null)
  const [sections, setSections] = useState<SongSection[]>([])
  const [loading, setLoading] = useState(true)
  const [showPresentation, setShowPresentation] = useState(false)

  useEffect(() => {
    getSong(id)
      .then(data => {
        if (!data) { router.push('/library'); return }
        setSong(data)
        setSections(data.sections ?? [])
      })
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-gray-500" />
      </div>
    )
  }

  if (!song) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        Biblioteca
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-100 flex-1">{song.title}</h1>
          {song.key && <Badge variant="amber" className="text-sm px-2.5 py-1">{song.key}</Badge>}
          {sections.length > 0 && (
            <button
              onClick={() => setShowPresentation(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-medium transition-colors shrink-0"
            >
              <Expand size={15} />
              Apresentar
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {song.artist && <span className="text-sm text-gray-400">{song.artist}</span>}
          {song.bpm && <span className="text-sm text-gray-600">{song.bpm} BPM</span>}
          {song.tags?.map(tag => <Badge key={tag}>{tag}</Badge>)}
        </div>
        {song.notes && (
          <p className="mt-2 text-sm text-gray-500 italic">{song.notes}</p>
        )}
      </div>

      {/* Guia */}
      {song.guide && (
        <div className="mb-6 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Guia</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {song.guide.split('>').map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 font-medium whitespace-nowrap">
                  {part.trim()}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-amber-500/60 text-sm font-bold">›</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audio player — somente leitura */}
      {(song.audio_files?.length ?? 0) > 0 && (
        <div className="mb-6">
          <AudioPlayerReadOnly files={song.audio_files ?? []} />
        </div>
      )}

      {/* Sections — somente leitura */}
      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-gray-800 text-center">
          <Music2 size={28} className="text-gray-700" />
          <p className="text-gray-500 text-sm">Nenhuma seção cadastrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map(section => {
            const colorClass = SECTION_COLORS[section.type as keyof typeof SECTION_COLORS] ?? SECTION_COLORS.other
            return (
              <div
                key={section.id}
                className={cn(
                  'rounded-xl border overflow-hidden bg-gray-900/60',
                  colorClass.split(' ').filter(c => c.startsWith('border')).join(' ')
                )}
              >
                {/* Section header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/60">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border',
                    colorClass
                  )}>
                    {SECTION_LABELS[section.type as keyof typeof SECTION_LABELS] ?? section.type}
                  </span>
                  {section.title !== SECTION_LABELS[section.type as keyof typeof SECTION_LABELS] && section.title && (
                    <span className="text-sm font-semibold text-gray-100">{section.title}</span>
                  )}
                </div>

                {/* Observation */}
                {section.observation && (
                  <div className="px-4 pt-2.5 text-xs text-gray-500 italic">
                    {section.observation}
                  </div>
                )}

                {/* Content */}
                <div className="px-4 py-3">
                  <ChordDisplay content={section.content} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Link para editar */}
      <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
        <Link
          href={`/songs/${song.id}`}
          className="text-xs text-gray-600 hover:text-amber-400 transition-colors"
        >
          Ir para o Editor de Cifras →
        </Link>
      </div>

      {showPresentation && (
        <PresentationMode
          song={song}
          sections={sections}
          onClose={() => setShowPresentation(false)}
        />
      )}
    </div>
  )
}

/* Player somente leitura — sem upload, sem delete */
function AudioPlayerReadOnly({ files }: { files: import('@/lib/types').AudioFile[] }) {
  const [activeId, setActiveId] = useState(files[0]?.id ?? null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useState(() => {
    if (typeof window === 'undefined') return null
    return new Audio()
  })[0]

  const active = files.find(f => f.id === activeId)

  useEffect(() => {
    if (!audioRef || !active) return
    audioRef.src = active.file_url
    audioRef.load()
    setProgress(0); setDuration(0); setPlaying(false)
  }, [activeId, active, audioRef])

  useEffect(() => {
    if (!audioRef) return
    const onTime = () => setProgress(audioRef.currentTime)
    const onDur = () => setDuration(audioRef.duration)
    const onEnd = () => { setPlaying(false); setProgress(0) }
    audioRef.addEventListener('timeupdate', onTime)
    audioRef.addEventListener('loadedmetadata', onDur)
    audioRef.addEventListener('ended', onEnd)
    return () => {
      audioRef.removeEventListener('timeupdate', onTime)
      audioRef.removeEventListener('loadedmetadata', onDur)
      audioRef.removeEventListener('ended', onEnd)
    }
  }, [audioRef])

  const toggle = () => {
    if (!audioRef) return
    if (playing) { audioRef.pause(); setPlaying(false) }
    else { audioRef.play(); setPlaying(true) }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      {files.length > 1 && (
        <div className="p-3 border-b border-gray-800 space-y-1">
          {files.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveId(f.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm',
                activeId === f.id ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400 hover:bg-gray-800'
              )}
            >
              {f.description || f.file_name}
            </button>
          ))}
        </div>
      )}
      {active && (
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 flex items-center justify-center shrink-0 transition-colors"
          >
            {playing ? '⏸' : '▶'}
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <input
              type="range" min={0} max={duration || 100} value={progress}
              onChange={e => { if (audioRef) { audioRef.currentTime = Number(e.target.value); setProgress(Number(e.target.value)) } }}
              className="w-full h-1.5 accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{fmt(progress)}</span><span>{fmt(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
