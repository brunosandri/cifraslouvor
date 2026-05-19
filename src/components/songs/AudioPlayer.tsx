'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Play, Pause, Upload, Trash2, Volume2, VolumeX, Loader2, Music
} from 'lucide-react'
import { uploadAudioFile, deleteAudioFile } from '@/lib/db'
import type { AudioFile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

interface Props {
  songId: string
  files: AudioFile[]
}

export function AudioPlayer({ songId, files: initialFiles }: Props) {
  const [files, setFiles] = useState<AudioFile[]>(initialFiles)
  const [activeId, setActiveId] = useState<string | null>(files[0]?.id ?? null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [description, setDescription] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const active = files.find(f => f.id === activeId)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setProgress(audio.currentTime)
    const onDuration = () => setDuration(audio.duration)
    const onEnded = () => { setPlaying(false); setProgress(0) }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDuration)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onDuration)
      audio.removeEventListener('ended', onEnded)
    }
  }, [activeId])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !active) return
    audio.src = active.file_url
    audio.load()
    setProgress(0)
    setDuration(0)
    setPlaying(false)
  }, [activeId, active])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const t = Number(e.target.value)
    audio.currentTime = t
    setProgress(t)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !muted
    setMuted(!muted)
  }

  const handleUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    try {
      const uploaded = await uploadAudioFile(songId, file, description)
      setFiles(prev => [...prev, uploaded])
      setActiveId(uploaded.id)
      setShowUpload(false)
      setDescription('')
      toast('Áudio enviado com sucesso!')
    } catch {
      toast('Erro ao enviar áudio', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (file: AudioFile) => {
    if (!confirm(`Remover "${file.file_name}"?`)) return
    try {
      await deleteAudioFile(file)
      setFiles(prev => prev.filter(f => f.id !== file.id))
      if (activeId === file.id) {
        const remaining = files.filter(f => f.id !== file.id)
        setActiveId(remaining[0]?.id ?? null)
        setPlaying(false)
      }
      toast('Áudio removido')
    } catch {
      toast('Erro ao remover áudio', 'error')
    }
  }

  if (files.length === 0 && !showUpload) {
    return (
      <button
        onClick={() => setShowUpload(true)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-400 transition-colors py-1"
      >
        <Upload size={14} />
        Adicionar playback / VS
      </button>
    )
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <audio ref={audioRef} />

      {/* Track list */}
      {files.length > 0 && (
        <div className="p-3 border-b border-gray-800 space-y-1">
          {files.map(file => (
            <div
              key={file.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group',
                activeId === file.id ? 'bg-amber-500/10' : 'hover:bg-gray-800'
              )}
              onClick={() => setActiveId(file.id)}
            >
              <Music size={14} className={activeId === file.id ? 'text-amber-400' : 'text-gray-600'} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm truncate',
                  activeId === file.id ? 'text-amber-400 font-medium' : 'text-gray-300'
                )}>
                  {file.description || file.file_name}
                </p>
                {file.description && (
                  <p className="text-xs text-gray-600 truncate">{file.file_name}</p>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(file) }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Player controls */}
      {active && (
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="primary"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={togglePlay}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </Button>

          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={seek}
              className="w-full h-1.5 accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <button onClick={toggleMute} className="text-gray-500 hover:text-gray-300 transition-colors">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      )}

      {/* Upload form */}
      {showUpload ? (
        <div className="p-4 border-t border-gray-800 space-y-3">
          <p className="text-sm font-medium text-gray-300">Adicionar áudio</p>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descrição (ex: Playback G, VS soprano)"
            className="h-9 w-full rounded-lg bg-gray-800 border border-gray-700 px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Enviando...' : 'Selecionar arquivo'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
              Cancelar
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="px-4 pb-3 flex justify-end">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            <Upload size={12} />
            Adicionar áudio
          </button>
        </div>
      )}
    </div>
  )
}
