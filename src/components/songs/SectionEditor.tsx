'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChordDisplay } from './ChordDisplay'
import { createSection, updateSection } from '@/lib/db'
import { SECTION_LABELS, type SongSection, type SectionType, type SectionFormData } from '@/lib/types'
import { Eye, Code2 } from 'lucide-react'

const sectionTypeOptions = Object.entries(SECTION_LABELS).map(([value, label]) => ({ value, label }))

interface Props {
  open: boolean
  onClose: () => void
  songId?: string
  section?: SongSection
  orderIndex?: number
  onSaved: (section: SongSection) => void
}

export function SectionEditor({ open, onClose, songId, section, orderIndex = 0, onSaved }: Props) {
  const [form, setForm] = useState<SectionFormData>({
    type: (section?.type as SectionType) ?? 'verse',
    title: section?.title ?? SECTION_LABELS['verse'],
    observation: section?.observation ?? '',
    content: section?.content ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  const setField = (field: keyof SectionFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    setForm(prev => {
      const next = { ...prev, [field]: value }
      // auto-update title when type changes
      if (field === 'type') {
        next.title = SECTION_LABELS[value as SectionType] ?? value
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) return
    setSaving(true)
    try {
      const saved = section
        ? await updateSection(section.id, form)
        : await createSection(songId!, form, orderIndex)
      onSaved(saved)
    } catch {
      alert('Erro ao salvar seção.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={section ? 'Editar seção' : 'Nova seção'}
      description="Use [Acorde] antes da sílaba para marcar cifras. Ex: [G]Senhor és [C]santo"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo"
            id="type"
            value={form.type}
            onChange={setField('type')}
            options={sectionTypeOptions}
          />
          <Input
            label="Título da seção"
            id="title"
            value={form.title}
            onChange={setField('title')}
            placeholder="Ex: Verso 1"
          />
        </div>

        <Input
          label="Observação (opcional)"
          id="observation"
          value={form.observation}
          onChange={setField('observation')}
          placeholder="Ex: Repetir 2x, tocar suave..."
        />

        {/* Content editor with preview toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Letra e cifras
            </span>
            <button
              type="button"
              onClick={() => setPreview(p => !p)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {preview ? <Code2 size={13} /> : <Eye size={13} />}
              {preview ? 'Editar' : 'Pré-visualizar'}
            </button>
          </div>

          {preview ? (
            <div className="min-h-[200px] p-4 rounded-lg bg-gray-800 border border-gray-700">
              {form.content.trim() ? (
                <ChordDisplay content={form.content} />
              ) : (
                <p className="text-gray-600 text-sm italic">Nenhum conteúdo ainda...</p>
              )}
            </div>
          ) : (
            <textarea
              value={form.content}
              onChange={setField('content')}
              placeholder={`[G]Senhor és Santo\nDigno de [Em]louvor [C]sempre`}
              rows={10}
              className="chord-editor w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-3 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
            />
          )}

          <p className="mt-1.5 text-xs text-gray-600">
            Use <code className="text-amber-500">[Acorde]</code> para marcar cifras inline.
            Ex: <code className="text-gray-400">[G]Quão grande és tu</code>
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving || !form.content.trim()}>
            {saving ? 'Salvando...' : section ? 'Salvar' : 'Adicionar seção'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
