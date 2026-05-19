'use client'

import { useState } from 'react'
import {
  GripVertical, Pencil, Trash2, ChevronDown, ChevronUp, Eye, Code2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SongSection, SectionType } from '@/lib/types'
import { SECTION_LABELS, SECTION_COLORS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ChordDisplay } from './ChordDisplay'
import { SectionEditor } from './SectionEditor'
import { deleteSection } from '@/lib/db'
import { useToast } from '@/components/ui/toast'

interface Props {
  section: SongSection
  onUpdate: (updated: SongSection) => void
  onDelete: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function SectionContainer({ section, onUpdate, onDelete, dragHandleProps }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const colorClass = SECTION_COLORS[section.type as SectionType] ?? SECTION_COLORS.other

  const handleDelete = async () => {
    if (!confirm(`Excluir seção "${section.title}"?`)) return
    setDeleting(true)
    try {
      await deleteSection(section.id)
      onDelete(section.id)
      toast('Seção excluída')
    } catch {
      toast('Erro ao excluir seção', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className={cn(
        'rounded-xl border overflow-hidden',
        colorClass.split(' ').filter(c => c.startsWith('border')).join(' '),
        'bg-gray-900/60'
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/60">
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 touch-none"
          >
            <GripVertical size={16} />
          </div>

          {/* Type badge */}
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border',
            colorClass
          )}>
            {SECTION_LABELS[section.type as SectionType] ?? section.type}
          </span>

          {/* Title */}
          <span className="text-sm font-semibold text-gray-100 flex-1 truncate">
            {section.title !== SECTION_LABELS[section.type as SectionType] && section.title
              ? section.title
              : ''}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowRaw(r => !r)}
              title={showRaw ? 'Ver formatado' : 'Ver texto bruto'}
            >
              {showRaw ? <Eye size={14} /> : <Code2 size={14} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditing(true)}
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCollapsed(c => !c)}
            >
              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </Button>
          </div>
        </div>

        {/* Observation */}
        {section.observation && !collapsed && (
          <div className="px-4 pt-2.5 text-xs text-gray-500 italic">
            {section.observation}
          </div>
        )}

        {/* Content */}
        {!collapsed && (
          <div className="px-4 py-3">
            {showRaw ? (
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                {section.content}
              </pre>
            ) : (
              <ChordDisplay content={section.content} />
            )}
          </div>
        )}
      </div>

      {editing && (
        <SectionEditor
          open={editing}
          onClose={() => setEditing(false)}
          section={section}
          onSaved={updated => {
            onUpdate(updated)
            setEditing(false)
          }}
        />
      )}
    </>
  )
}
