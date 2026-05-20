'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Song, SongSection } from '@/lib/types'
import { SECTION_LABELS, SECTION_COLORS } from '@/lib/types'
import { ChordDisplay } from './ChordDisplay'

interface Props {
  song: Song
  sections: SongSection[]
  onClose: () => void
}

export function PresentationMode({ song, sections, onClose }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [fontSize, setFontSize] = useState(1)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeIdx, sections.length])

  const prev = () => setActiveIdx(i => Math.max(0, i - 1))
  const next = () => setActiveIdx(i => Math.min(sections.length - 1, i + 1))

  const activeSection = sections[activeIdx]

  return (
    <div className="fixed inset-0 z-[200] bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-bold text-gray-100 truncate">{song.title}</h1>
          {song.key && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0">
              {song.key}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Font size */}
          <button
            onClick={() => setFontSize(f => Math.max(0.6, f - 0.1))}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-200"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => setFontSize(f => Math.min(2, f + 0.1))}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-200"
          >
            <Plus size={14} />
          </button>

          {/* Toggle all/one */}
          <button
            onClick={() => setShowAll(s => !s)}
            className={cn(
              'px-3 h-8 rounded-lg text-xs font-medium transition-colors',
              showAll ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            )}
          >
            {showAll ? 'Por seção' : 'Tudo'}
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Guia */}
      {song.guide && (
        <div className="px-4 py-2 border-b border-gray-800 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {song.guide.split('>').map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border transition-colors',
                  !showAll && i === activeIdx
                    ? 'bg-amber-500 text-gray-950 border-amber-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                )}>
                  {part.trim()}
                </span>
                {i < arr.length - 1 && <span className="text-gray-700 text-xs">›</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showAll ? (
          /* Modo: todas as seções */
          <div className="px-4 py-4 space-y-6">
            {sections.map(section => {
              const colorClass = SECTION_COLORS[section.type as keyof typeof SECTION_COLORS] ?? SECTION_COLORS.other
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border',
                      colorClass
                    )}>
                      {SECTION_LABELS[section.type as keyof typeof SECTION_LABELS] ?? section.type}
                    </span>
                    {section.observation && (
                      <span className="text-xs text-gray-500 italic">{section.observation}</span>
                    )}
                  </div>
                  <div style={{ fontSize: `${fontSize}rem` }}>
                    <ChordDisplay content={section.content} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Modo: seção por seção */
          activeSection && (
            <div className="flex flex-col h-full">
              {/* Section label */}
              <div className="px-4 pt-4 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  {(() => {
                    const colorClass = SECTION_COLORS[activeSection.type as keyof typeof SECTION_COLORS] ?? SECTION_COLORS.other
                    return (
                      <span className={cn(
                        'px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider border',
                        colorClass
                      )}>
                        {SECTION_LABELS[activeSection.type as keyof typeof SECTION_LABELS] ?? activeSection.type}
                      </span>
                    )
                  })()}
                  {activeSection.observation && (
                    <span className="text-sm text-gray-500 italic">{activeSection.observation}</span>
                  )}
                </div>
              </div>

              {/* Lyrics */}
              <div className="flex-1 overflow-y-auto px-4 pb-24" style={{ fontSize: `${fontSize}rem` }}>
                <ChordDisplay content={activeSection.content} />
              </div>
            </div>
          )
        )}
      </div>

      {/* Bottom navigation (seção por seção) */}
      {!showAll && sections.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gray-950 border-t border-gray-800">
          <button
            onClick={prev}
            disabled={activeIdx === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          <span className="text-xs text-gray-600">
            {activeIdx + 1} / {sections.length}
          </span>

          <button
            onClick={next}
            disabled={activeIdx === sections.length - 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Próxima
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Swipe areas (mobile) */}
      {!showAll && (
        <>
          <div
            className="fixed left-0 top-1/4 bottom-24 w-1/3 cursor-pointer"
            onClick={prev}
          />
          <div
            className="fixed right-0 top-1/4 bottom-24 w-1/3 cursor-pointer"
            onClick={next}
          />
        </>
      )}
    </div>
  )
}
