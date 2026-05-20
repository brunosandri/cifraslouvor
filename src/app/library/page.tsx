'use client'

import { useEffect, useState } from 'react'
import { getSongs } from '@/lib/db'
import type { Song } from '@/lib/types'
import { Music2, Loader2, BookOpen, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    getSongs().then(setSongs).finally(() => setLoading(false))
  }, [])

  const keys = [...new Set(songs.map(s => s.key).filter(Boolean) as string[])].sort()
  const tags = [...new Set(songs.flatMap(s => s.tags ?? []))].sort()

  const filtered = songs.filter(s => {
    if (activeKey && s.key !== activeKey) return false
    if (activeTag && !s.tags?.includes(activeTag)) return false
    if (query && !s.title.toLowerCase().includes(query.toLowerCase()) && !s.artist?.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={20} className="text-amber-400" />
        <h1 className="text-xl font-bold text-gray-100">Biblioteca</h1>
        <span className="text-sm text-gray-500">{filtered.length} música{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar música..."
          className="h-10 w-full rounded-lg bg-gray-800 border border-gray-700 pl-9 pr-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Filters */}
      {(keys.length > 0 || tags.length > 0) && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
          {keys.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-600">Tom:</span>
              <button
                onClick={() => setActiveKey(null)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${!activeKey ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
              >
                Todos
              </button>
              {keys.map(k => (
                <button
                  key={k}
                  onClick={() => setActiveKey(k === activeKey ? null : k)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${activeKey === k ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
                >
                  {k}
                </button>
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-600">Tag:</span>
              {tags.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t === activeTag ? null : t)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${activeTag === t ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Music2 size={32} className="text-gray-700" />
          <p className="text-gray-500">Nenhuma música encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(song => (
            <Link
              key={song.id}
              href={`/library/${song.id}`}
              className="group flex flex-col gap-2 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-100 group-hover:text-amber-400 transition-colors leading-snug">
                  {song.title}
                </p>
                {song.key && <Badge variant="amber" className="shrink-0">{song.key}</Badge>}
              </div>
              {song.artist && <p className="text-xs text-gray-500">{song.artist}</p>}
              {song.guide && (
                <p className="text-xs text-gray-600 truncate">{song.guide}</p>
              )}
              {song.tags && song.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {song.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
