'use client'

import { ExternalLink, Database, Music2, FileText } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-100 mb-6">Configurações</h1>

      <div className="space-y-4">
        <section className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Database size={15} className="text-amber-400" />
            Banco de dados (Supabase)
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Este app usa o Supabase como banco de dados e armazenamento de áudio.
            Configure as variáveis de ambiente no arquivo <code className="text-amber-400 text-xs">.env.local</code>.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-800">
              <span className="text-xs text-gray-500 font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
              <span className="text-xs text-gray-600">configurado no .env.local</span>
            </div>
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-800">
              <span className="text-xs text-gray-500 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span className="text-xs text-gray-600">configurado no .env.local</span>
            </div>
          </div>
          <a
            href="https://app.supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Abrir Supabase Dashboard
            <ExternalLink size={11} />
          </a>
        </section>

        <section className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <FileText size={15} className="text-amber-400" />
            Formato das cifras
          </h2>
          <div className="space-y-2 text-sm text-gray-500">
            <p>As cifras são marcadas com colchetes <code className="text-amber-400">[Acorde]</code> antes da sílaba correspondente.</p>
            <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs">
              <p className="text-amber-400">G          Em         C</p>
              <p className="text-gray-300">[G]Senhor és Santo, [Em]digno de [C]louvor</p>
            </div>
            <p className="text-xs">O editor exibe os acordes acima das letras automaticamente.</p>
          </div>
        </section>

        <section className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Music2 size={15} className="text-amber-400" />
            Sobre o CifrasLouvor
          </h2>
          <p className="text-sm text-gray-500">
            Biblioteca de cifras para ministérios de louvor. Organize músicas por seções
            (verso, refrão, ponte...), importe PDFs e gerencie playbacks em MP3.
          </p>
        </section>
      </div>
    </div>
  )
}
