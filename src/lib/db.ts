import { createClient } from './supabase/client'
import type { Song, SongSection, AudioFile, SongFormData, SectionFormData } from './types'

// ── Songs ──────────────────────────────────────────────────────────────────

export async function getSongs(): Promise<Song[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('title', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getSong(id: string): Promise<Song | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('songs')
    .select(`*, sections:song_sections(*), audio_files(*)`)
    .eq('id', id)
    .single()
  if (error) return null
  if (!data) return null
  return {
    ...data,
    sections: (data.sections as SongSection[]).sort((a, b) => a.order_index - b.order_index),
  }
}

export async function createSong(form: SongFormData): Promise<Song> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('songs')
    .insert({
      title: form.title.trim(),
      artist: form.artist.trim() || null,
      key: form.key || null,
      bpm: form.bpm ? Number(form.bpm) : null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      notes: form.notes.trim() || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSong(id: string, form: Partial<SongFormData>): Promise<Song> {
  const supabase = createClient()
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (form.title !== undefined) payload.title = form.title.trim()
  if (form.artist !== undefined) payload.artist = form.artist.trim() || null
  if (form.key !== undefined) payload.key = form.key || null
  if (form.bpm !== undefined) payload.bpm = form.bpm ? Number(form.bpm) : null
  if (form.tags !== undefined) payload.tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
  if (form.notes !== undefined) payload.notes = form.notes.trim() || null

  const { data, error } = await supabase
    .from('songs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSong(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('songs').delete().eq('id', id)
  if (error) throw error
}

export async function searchSongs(query: string): Promise<Song[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
    .order('title', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ── Sections ───────────────────────────────────────────────────────────────

export async function createSection(songId: string, form: SectionFormData, orderIndex: number): Promise<SongSection> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('song_sections')
    .insert({
      song_id: songId,
      type: form.type,
      title: form.title.trim(),
      observation: form.observation.trim() || null,
      content: form.content,
      order_index: orderIndex,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSection(id: string, updates: Partial<SectionFormData>): Promise<SongSection> {
  const supabase = createClient()
  const payload: Record<string, unknown> = {}
  if (updates.type !== undefined) payload.type = updates.type
  if (updates.title !== undefined) payload.title = updates.title.trim()
  if (updates.observation !== undefined) payload.observation = updates.observation.trim() || null
  if (updates.content !== undefined) payload.content = updates.content

  const { data, error } = await supabase
    .from('song_sections')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSection(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('song_sections').delete().eq('id', id)
  if (error) throw error
}

export async function reorderSections(sections: { id: string; order_index: number }[]): Promise<void> {
  const supabase = createClient()
  await Promise.all(
    sections.map(({ id, order_index }) =>
      supabase.from('song_sections').update({ order_index }).eq('id', id)
    )
  )
}

// ── Audio Files ────────────────────────────────────────────────────────────

export async function uploadAudioFile(songId: string, file: File, description: string): Promise<AudioFile> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${songId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('audio')
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(path)

  const { data, error } = await supabase
    .from('audio_files')
    .insert({
      song_id: songId,
      file_url: publicUrl,
      file_name: file.name,
      description: description.trim() || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAudioFile(audioFile: AudioFile): Promise<void> {
  const supabase = createClient()
  const url = new URL(audioFile.file_url)
  const path = url.pathname.split('/audio/')[1]
  await supabase.storage.from('audio').remove([path])
  const { error } = await supabase.from('audio_files').delete().eq('id', audioFile.id)
  if (error) throw error
}
