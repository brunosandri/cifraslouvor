/**
 * Script de importação de cifras para o Supabase
 *
 * Como usar:
 *  1. Coloque os arquivos .txt na pasta scripts/songs/
 *  2. Preencha as variáveis abaixo com os dados do seu projeto Supabase
 *  3. Execute: node scripts/seed.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

// ──────────────────────────────────────────────
// CONFIGURAÇÃO — preencha com suas credenciais
// ──────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'COLE_SUA_URL_AQUI'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'COLE_SUA_KEY_AQUI'
// ──────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const SONGS_DIR = join(__dirname, 'songs')

if (SUPABASE_URL.includes('COLE')) {
  console.error('❌  Preencha SUPABASE_URL e SUPABASE_KEY no início do script.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Corrige mojibake (UTF-8 lido como Latin-1)
function fixEncoding(str) {
  try {
    const fixed = Buffer.from(str, 'latin1').toString('utf8')
    // Valida: se contém sequências inválidas, fica com o original
    return /[ÃÂ]/.test(fixed) ? str : fixed
  } catch {
    return str
  }
}

// Extrai tom do nome do arquivo: "Musica_D_formatado.txt" → "D"
function extractKey(filename) {
  const m = basename(filename, '.txt').match(/_([A-Gb#]+)_formatado$/i)
  return m ? m[1] : null
}

// Mapeia cabeçalho "== TIPO ==" para nossos tipos
function parseSectionHeader(line) {
  const m = line.trim().match(/^==\s*(.+?)\s*==$/)
  if (!m) return null
  const raw = fixEncoding(m[1]).trim()
  const up = raw.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

  if (up === 'INTRO' || up === 'REINTRO') return { type: 'intro', label: raw }
  if (up === 'VERSO' || up === 'ESTROFE') return { type: 'verse', label: 'Verso' }
  if (up === 'VERSO 2') return { type: 'verse2', label: 'Verso 2' }
  if (up === 'VERSO 3') return { type: 'verse3', label: 'Verso 3' }
  if (up === 'VERSO 4') return { type: 'verse4', label: 'Verso 4' }
  if (up === 'REFRAO' || up === 'REFRÃO' || up.startsWith('REFR')) return { type: 'chorus', label: 'Refrão' }
  if (up.includes('PRE') && up.includes('REFR')) return { type: 'pre-chorus', label: 'Pré-refrão' }
  if (up === 'PONTE') return { type: 'bridge', label: 'Ponte' }
  if (up === 'INSTRUMENTAL') return { type: 'instrumental', label: 'Instrumental' }
  if (up === 'SOLO') return { type: 'instrumental', label: 'Solo' }
  if (up === 'FINAL' || up === 'OUTRO') return { type: 'outro', label: 'Final' }
  if (up === 'TAG') return { type: 'other', label: 'Tag' }
  if (up === 'PASSAGEM') return { type: 'other', label: 'Passagem' }

  return { type: 'other', label: raw }
}

function parseFile(rawContent, filename) {
  const content = fixEncoding(rawContent)
  const lines = content.split('\n').map(l => l.trimEnd())

  // Título (primeira linha não vazia)
  let i = 0
  while (i < lines.length && !lines[i].trim()) i++
  const title = lines[i++]?.trim() || 'Sem título'

  // Artista (segunda linha não vazia, se não for seção)
  while (i < lines.length && !lines[i].trim()) i++
  let artist = null
  if (lines[i] && !lines[i].trim().startsWith('==')) {
    artist = lines[i++].trim() || null
  }

  const key = extractKey(filename)
  const sections = []
  let current = null

  const flush = () => {
    if (current && current.content.trim()) {
      sections.push({ ...current, content: current.content.trim() })
      current = null
    }
  }

  for (; i < lines.length; i++) {
    const header = parseSectionHeader(lines[i])
    if (header) {
      flush()
      current = { type: header.type, title: header.label, content: '' }
      continue
    }
    if (current) current.content += lines[i] + '\n'
  }
  flush()

  return { title, artist, key, sections }
}

async function insertSong({ title, artist, key, sections }) {
  process.stdout.write(`  → ${title}... `)

  const { data: song, error: songErr } = await supabase
    .from('songs')
    .insert({ title, artist: artist || null, key: key || null, tags: [], bpm: null, notes: null, guide: null })
    .select()
    .single()

  if (songErr) {
    console.log(`❌  ${songErr.message}`)
    return
  }

  for (let idx = 0; idx < sections.length; idx++) {
    const s = sections[idx]
    const { error } = await supabase.from('song_sections').insert({
      song_id: song.id,
      type: s.type,
      title: s.title,
      observation: null,
      content: s.content,
      order_index: idx,
    })
    if (error) console.warn(`\n     ⚠ Seção "${s.title}": ${error.message}`)
  }

  console.log(`✓  (${sections.length} seções, tom: ${key || '—'})`)
}

async function main() {
  if (!existsSync(SONGS_DIR)) {
    console.log('Pasta scripts/songs/ não encontrada. Crie e coloque os .txt lá.')
    process.exit(1)
  }

  const files = readdirSync(SONGS_DIR).filter(f => f.toLowerCase().endsWith('.txt'))

  if (!files.length) {
    console.log('Nenhum arquivo .txt encontrado em scripts/songs/')
    process.exit(1)
  }

  console.log(`\n🎵  Importando ${files.length} cifra(s)...\n`)

  for (const file of files.sort()) {
    const raw = readFileSync(join(SONGS_DIR, file), 'latin1')
    const data = parseFile(raw, file)
    await insertSong(data)
  }

  console.log('\n✅  Importação concluída!\n')
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
