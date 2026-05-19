'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Edit2, Music2, Loader2 } from 'lucide-react'
import { getSong, updateSong, reorderSections } from '@/lib/db'
import type { Song, SongSection } from '@/lib/types'
import { SECTION_LABELS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionContainer } from '@/components/songs/SectionContainer'
import { SectionEditor } from '@/components/songs/SectionEditor'
import { AudioPlayer } from '@/components/songs/AudioPlayer'
import { PDFImporter } from '@/components/songs/PDFImporter'
import { SongFormDialog } from '@/components/songs/SongFormDialog'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [song, setSong] = useState<Song | null>(null)
  const [sections, setSections] = useState<SongSection[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewSection, setShowNewSection] = useState(false)
  const [showEditSong, setShowEditSong] = useState(false)
  const [showPDF, setShowPDF] = useState(false)

  useEffect(() => {
    getSong(id)
      .then(data => {
        if (!data) { router.push('/songs'); return }
        setSong(data)
        setSections(data.sections ?? [])
      })
      .catch(() => toast('Erro ao carregar cifra', 'error'))
      .finally(() => setLoading(false))
  }, [id, router, toast])

  const handleSectionUpdate = (updated: SongSection) => {
    setSections(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  const handleSectionDelete = (deletedId: string) => {
    setSections(prev => prev.filter(s => s.id !== deletedId))
  }

  const handleSectionAdded = (newSection: SongSection) => {
    setSections(prev => [...prev, newSection])
    setShowNewSection(false)
    toast('Seção adicionada!')
  }

  const handlePDFSections = (newSections: SongSection[]) => {
    setSections(prev => [...prev, ...newSections])
    setShowPDF(false)
    toast(`${newSections.length} seção(ões) importada(s) do PDF!`)
  }

  const moveSection = async (index: number, dir: -1 | 1) => {
    const next = [...sections]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    const reindexed = next.map((s, i) => ({ ...s, order_index: i }))
    setSections(reindexed)
    await reorderSections(reindexed.map(s => ({ id: s.id, order_index: s.order_index })))
  }

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
        href="/songs"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        Todas as cifras
      </Link>

      {/* Song header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-100 truncate">{song.title}</h1>
            {song.key && <Badge variant="amber" className="text-sm px-2.5 py-1">{song.key}</Badge>}
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
        <Button variant="outline" size="sm" onClick={() => setShowEditSong(true)}>
          <Edit2 size={14} />
          Editar
        </Button>
      </div>

      {/* Audio player */}
      {(song.audio_files?.length ?? 0) > 0 && (
        <div className="mb-6">
          <AudioPlayer songId={song.id} files={song.audio_files ?? []} />
        </div>
      )}

      {/* Add audio button if no files */}
      {(song.audio_files?.length ?? 0) === 0 && (
        <div className="mb-6">
          <AudioPlayer songId={song.id} files={[]} />
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3 mb-6">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl border border-dashed border-gray-800 text-center">
            <Music2 size={32} className="text-gray-700" />
            <div>
              <p className="text-gray-400 font-medium">Nenhuma seção ainda</p>
              <p className="text-sm text-gray-600 mt-1">
                Adicione seções manualmente ou importe um PDF
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => setShowNewSection(true)}>
                <Plus size={15} />
                Adicionar seção
              </Button>
              <Button variant="outline" onClick={() => setShowPDF(true)}>
                Importar PDF
              </Button>
            </div>
          </div>
        ) : (
          sections.map((section, i) => (
            <div key={section.id} className="relative group/move">
              {/* Move buttons */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover/move:opacity-100 transition-opacity">
                <button
                  onClick={() => moveSection(i, -1)}
                  disabled={i === 0}
                  className="text-gray-600 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveSection(i, 1)}
                  disabled={i === sections.length - 1}
                  className="text-gray-600 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                >
                  ▼
                </button>
              </div>
              <SectionContainer
                section={section}
                onUpdate={handleSectionUpdate}
                onDelete={handleSectionDelete}
                dragHandleProps={{}}
              />
            </div>
          ))
        )}
      </div>

      {/* Add section bar */}
      {sections.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button variant="primary" onClick={() => setShowNewSection(true)}>
            <Plus size={15} />
            Adicionar seção
          </Button>
          <Button variant="outline" onClick={() => setShowPDF(true)}>
            Importar PDF
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {showNewSection && (
        <SectionEditor
          open
          onClose={() => setShowNewSection(false)}
          songId={song.id}
          orderIndex={sections.length}
          onSaved={handleSectionAdded}
        />
      )}

      {showEditSong && (
        <SongFormDialog
          open
          onClose={() => setShowEditSong(false)}
          initialData={song}
          onSaved={updated => {
            setSong(updated)
            setShowEditSong(false)
            toast('Cifra atualizada!')
          }}
        />
      )}

      {showPDF && (
        <PDFImporter
          open
          onClose={() => setShowPDF(false)}
          songId={song.id}
          nextOrderIndex={sections.length}
          onImported={handlePDFSections}
        />
      )}
    </div>
  )
}
