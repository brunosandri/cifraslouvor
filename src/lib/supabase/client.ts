import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let clientInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (clientInstance) return clientInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      `Supabase não configurado. URL: ${url ? 'ok' : 'FALTANDO'}, KEY: ${key ? 'ok' : 'FALTANDO'}`
    )
  }

  clientInstance = createSupabaseClient(url, key)
  return clientInstance
}
