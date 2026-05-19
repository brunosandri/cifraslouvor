'use client'

import { useState, useRef, useCallback } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ChordDisplay } from './ChordDisplay'
import { createSection } from '@/lib/db'
import {
  SECTION_LABELS, SECTION_COLORS,
  type SongSection, type SectionType, type SectionFormData
} from '@/lib/types'
import { Upload, FileText, Plus, Trash2, Eye, Code2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const sectionTypeOptions = Object.entries(SECTION_LABELS).map(([value, label]) => ({ value, label }))

interface DraftSection {
  id: string
  type: SectionType
  title: string
  observation: string
  content: string
}

interface Props {
  open: boolean
  onClose: () => void
  songId: string
  nextOrderIndex: number
  onImported: (sections: SongSection[]) => void
}

export function PDFImporter({ open, onClose, songId, nextOrderIndex, onImported }: Props) {
  const [step, setStep] = useState<'upload' | 'edit'>('upload')
  const [rawText, setRawText] = useState('')
  const [drafts, setDrafts] = useState<DraftSection[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const lines = content.items
        .filter((item): item is import('pdfjs-dist/types/src/display/api').TextItem =>
          'str' in item && 'transform' in item
        )
        .sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5]
          if (Math.abs(yDiff) > 3) return yDiff
          return a.transform[4] - b.transform[4]
        })
        .map(item => item.str)
        .join(' ')
      text += lines + '\n'
    }
    return text
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file) return
    setLoading(true)
    try {
      let text: string
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file)
      } else {
        text = await file.text()
      }
      setRawText(text)
      const parsed = parseTextToSections(text)
      setDrafts(parsed)
      setStep('edit')
    } catch (e) {
      alert('Erro ao processar o arquivo. Tente um PDF de texto (não escaneado).')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const parseTextToSections = (text: string): DraftSection[] => {
    const lines = text.split('\n').map(l => l.trim())
    const sections: DraftSection[] = []
    let current: DraftSection | null = null

    const sectionKeywords: { pattern: RegExp; type: SectionType; label: string }[] = [
      { pattern: /^intro(du[çc][aã]o)?[\s:.]*/i, type: 'intro', label: 'Introdução' },
      { pattern: /^verso\s*1[\s:.]*/i, type: 'verse1', label: 'Verso 1' },
      { pattern: /^verso\s*2[\s:.]*/i, type: 'verse2', label: 'Verso 2' },
      { pattern: /^verso\s*3[\s:.]*/i, type: 'verse3', label: 'Verso 3' },
      { pattern: /^verso[\s:.]*/i, type: 'verse', label: 'Verso' },
      { pattern: /^refr[aã]o[\s:.]*/i, type: 'chorus', label: 'Refrão' },
      { pattern: /^chorus[\s:.]*/i, type: 'chorus', label: 'Refrão' },
      { pattern: /^pr[eé]-refr[aã]o[\s:.]*/i, type: 'pre-chorus', label: 'Pré-refrão' },
      { pattern: /^ponte[\s:.]*/i, type: 'bridge', label: 'Ponte' },
      { pattern: /^bridge[\s:.]*/i, type: 'bridge', label: 'Ponte' },
      { pattern: /^instrumental[\s:.]*/i, type: 'instrumental', label: 'Instrumental' },
      { pattern: /^(final|outro)[\s:.]*/i, type: 'outro', label: 'Final' },
    ]

    const flush = () => {
      if (current && current.content.trim()) {
        sections.push({ ...current, content: current.content.trim() })
      }
    }

    for (const line of lines) {
      if (!line) continue
      const match = sectionKeywords.find(k => k.pattern.test(line))
      if (match) {
        flush()
        current = {
          id: Math.random().toString(36).slice(2),
          type: match.type,
          title: match.label,
          observation: '',
          content: '',
        }
        continue
      }
      if (!current) {
        current = {
          id: Math.random().toString(36).slice(2),
          type: 'verse',
          title: 'Verso',
          observation: '',
          content: '',
        }
      }
      current.content += line + '\n'
    }
    flush()

    if (sections.length === 0 && text.trim()) {
      sections.push({
        id: Math.random().toString(36).slice(2),
        type: 'verse',
        title: 'Verso',
        observation: '',
        content: text.trim(),
      })
    }

    return sections
  }

  const updateDraft = (id: string, field: keyof DraftSection, value: string) => {
    setDrafts(prev =>
      prev.map(d => {
        if (d.id !== id) return d
        const next = { ...d, [field]: value }
        if (field === 'type') next.title = SECTION_LABELS[value as SectionType] ?? value
        return next
      })
    )
  }

  const removeDraft = (id: string) => setDrafts(prev => prev.filter(d => d.id !== id))

  const addDraft = () => {
    setDrafts(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      type: 'verse',
      title: 'Verso',
      observation: '',
      content: '',
    }])
  }

  const handleSave = async () => {
    const valid = drafts.filter(d => d.content.trim())
    if (!valid.length) return
    setSaving(true)
    try {
      const created: SongSection[] = []
      for (let i = 0; i < valid.length; i++) {
        const d = valid[i]
        const form: SectionFormData = {
          type: d.type,
          title: d.title,
          observation: d.observation,
          content: d.content,
        }
        const section = await createSection(songId, form, nextOrderIndex + i)
        created.push(section)
      }
      onImported(created)
    } catch {
      alert('Erro ao salvar seções.')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setStep('upload')
    setRawText('')
    setDrafts([])
    setPreviewId(null)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Importar PDF / Texto"
      description={step === 'upload' ? 'Importe um PDF ou arquivo .txt com a cifra' : `${drafts.length} seção(ões) detectada(s) — edite e salve`}
      className="max-w-2xl"
    >
      {step === 'upload' ? (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
              dragOver
                ? 'border-amber-500 bg-amber-500/5'
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-amber-500" />
                <p className="text-sm text-gray-400">Processando arquivo...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center">
                  <Upload size={24} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Arraste um arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-600 mt-1">PDF ou TXT</p>
                </div>
              </div>
            )}
          </div>

          {/* Manual text paste */}
          <div>
            <p className="text-xs text-gray-500 mb-2 text-center">ou cole o texto diretamente</p>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={`Cole a cifra aqui...\n\nVerso 1\n[G]Senhor és Santo\n\nRefrão\nDigno de [C]louvor`}
              rows={8}
              className="chord-editor w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-3 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button
              variant="primary"
              disabled={!rawText.trim() || loading}
              onClick={() => {
                const parsed = parseTextToSections(rawText)
                setDrafts(parsed)
                setStep('edit')
              }}
            >
              <FileText size={15} />
              Processar texto
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {drafts.map((draft, idx) => {
              const colorClass = SECTION_COLORS[draft.type] ?? SECTION_COLORS.other
              const isPreview = previewId === draft.id
              return (
                <div key={draft.id} className={cn(
                  'rounded-xl border p-4 space-y-3',
                  colorClass.split(' ').filter(c => c.startsWith('border')).join(' '),
                  'bg-gray-900'
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-mono">#{idx + 1}</span>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <select
                        value={draft.type}
                        onChange={e => updateDraft(draft.id, 'type', e.target.value)}
                        className="h-8 rounded-lg bg-gray-800 border border-gray-700 px-2 text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {sectionTypeOptions.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <input
                        value={draft.title}
                        onChange={e => updateDraft(draft.id, 'title', e.target.value)}
                        placeholder="Título"
                        className="h-8 rounded-lg bg-gray-800 border border-gray-700 px-2 text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      onClick={() => setPreviewId(isPreview ? null : draft.id)}
                      className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                      title={isPreview ? 'Editar' : 'Pré-visualizar'}
                    >
                      {isPreview ? <Code2 size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => removeDraft(draft.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <input
                    value={draft.observation}
                    onChange={e => updateDraft(draft.id, 'observation', e.target.value)}
                    placeholder="Observação (opcional)"
                    className="h-7 w-full rounded-lg bg-gray-800/60 border border-gray-700 px-2 text-xs text-gray-400 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />

                  {isPreview ? (
                    <div className="bg-gray-800/60 rounded-lg p-3 min-h-[80px]">
                      <ChordDisplay content={draft.content} />
                    </div>
                  ) : (
                    <textarea
                      value={draft.content}
                      onChange={e => updateDraft(draft.id, 'content', e.target.value)}
                      rows={4}
                      className="chord-editor w-full rounded-lg bg-gray-800/60 border border-gray-700 px-3 py-2 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-y"
                    />
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={addDraft}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-700 text-sm text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors"
          >
            <Plus size={15} />
            Adicionar seção manualmente
          </button>

          <div className="flex justify-between gap-2 pt-1">
            <Button variant="ghost" onClick={reset}>
              ← Voltar
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button
                variant="primary"
                disabled={saving || !drafts.some(d => d.content.trim())}
                onClick={handleSave}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {saving ? 'Salvando...' : `Salvar ${drafts.filter(d => d.content.trim()).length} seção(ões)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
}
