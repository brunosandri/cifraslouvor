'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createSong, updateSong } from '@/lib/db'
import { MUSICAL_KEYS, type Song, type SongFormData } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: (song: Song) => void
  initialData?: Song
}

const keyOptions = [
  { value: '', label: 'Sem tom definido' },
  ...MUSICAL_KEYS.map(k => ({ value: k, label: k })),
]

export function SongFormDialog({ open, onClose, onSaved, initialData }: Props) {
  const [form, setForm] = useState<SongFormData>({
    title: initialData?.title ?? '',
    artist: initialData?.artist ?? '',
    key: initialData?.key ?? '',
    bpm: initialData?.bpm?.toString() ?? '',
    tags: initialData?.tags?.join(', ') ?? '',
    notes: initialData?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<SongFormData>>({})

  const set = (field: keyof SongFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const errs: Partial<SongFormData> = {}
    if (!form.title.trim()) errs.title = 'Título obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const song = initialData
        ? await updateSong(initialData.id, form)
        : await createSong(form)
      onSaved(song)
    } catch {
      setErrors({ title: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Editar cifra' : 'Nova cifra'}
      description="Preencha as informações da música"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título *"
          id="title"
          value={form.title}
          onChange={set('title')}
          placeholder="Nome da música"
          error={errors.title}
          autoFocus
        />
        <Input
          label="Artista / Banda"
          id="artist"
          value={form.artist}
          onChange={set('artist')}
          placeholder="Nome do artista ou banda"
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tom"
            id="key"
            value={form.key}
            onChange={set('key')}
            options={keyOptions}
          />
          <Input
            label="BPM"
            id="bpm"
            type="number"
            min="40"
            max="300"
            value={form.bpm}
            onChange={set('bpm')}
            placeholder="120"
          />
        </div>
        <Input
          label="Tags (separadas por vírgula)"
          id="tags"
          value={form.tags}
          onChange={set('tags')}
          placeholder="louvor, adoração, rápida"
        />
        <Textarea
          label="Observações"
          id="notes"
          value={form.notes}
          onChange={set('notes')}
          placeholder="Notas sobre a música..."
          rows={3}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Criar cifra'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
