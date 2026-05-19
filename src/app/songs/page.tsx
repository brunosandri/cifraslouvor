'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Music2, Loader2, RefreshCw } from 'lucide-react'
import { getSongs, searchSongs, deleteSong } from '@/lib/db'
import type { Song } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { SongFormDialog } from '@/components/songs/SongFormDialog'

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showNew, setShowNew] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = query.trim().length >= 2
        ? await searchSongs(query.trim())
        : await getSongs()
      setSongs(data)
    } catch {
      toast('Erro ao carregar cifras', 'error')
    } finally {
      setLoading(false)
    }
  }, [query, toast])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const handleDelete = async (song: Song) => {
    if (!confirm(`Excluir "${song.title}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteSong(song.id)
      setSongs(prev => prev.filter(s => s.id !== song.id))
      toast('Cifra excluída')
    } catch {
      toast('Erro ao excluir', 'error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Cifras</h1>
          <p className="text-sm text-gray-500">{songs.length} música{songs.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" onClick={() => setShowNew(true)}>
          <Plus size={16} />
          Nova cifra
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por título ou artista..."
          className="h-10 w-full rounded-lg bg-gray-800 border border-gray-700 pl-9 pr-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" />
        )}
      </div>

      {/* List */}
      {!loading && songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
            <Music2 size={28} className="text-gray-600" />
          </div>
          <div>
            <p className="text-gray-300 font-medium">
              {query ? 'Nenhuma cifra encontrada' : 'Nenhuma cifra cadastrada'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {query ? 'Tente outro termo' : 'Clique em "Nova cifra" para começar'}
            </p>
          </div>
          {!query && (
            <Button variant="primary" onClick={() => setShowNew(true)}>
              <Plus size={16} />
              Nova cifra
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map(song => (
            <SongCard key={song.id} song={song} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <SongFormDialog
        open={showNew}
        onClose={() => setShowNew(false)}
        onSaved={song => {
          setSongs(prev => [song, ...prev].sort((a, b) => a.title.localeCompare(b.title)))
          setShowNew(false)
          toast('Cifra criada com sucesso!')
        }}
      />
    </div>
  )
}

function SongCard({ song, onDelete }: { song: Song; onDelete: (s: Song) => void }) {
  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Music2 size={18} className="text-amber-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/songs/${song.id}`}
            className="text-sm font-semibold text-gray-100 hover:text-amber-400 transition-colors truncate"
          >
            {song.title}
          </Link>
          {song.key && (
            <Badge variant="amber">{song.key}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {song.artist && (
            <span className="text-xs text-gray-500">{song.artist}</span>
          )}
          {song.bpm && (
            <span className="text-xs text-gray-600">{song.bpm} BPM</span>
          )}
          {song.tags?.map(tag => (
            <Badge key={tag} className="text-xs">{tag}</Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/songs/${song.id}`} className="inline-flex items-center h-7 px-2.5 text-xs rounded-md text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors">
          Abrir
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={() => onDelete(song)}
        >
          Excluir
        </Button>
      </div>
    </div>
  )
}
