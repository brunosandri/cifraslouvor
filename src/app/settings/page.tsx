'use client'

import { ExternalLink, Database, Music2, FileText, BookOpen, Plus, Upload, Mic2 } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-100 mb-6">Configurações</h1>

      <div className="space-y-4">

        {/* GUIA */}
        <section className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <BookOpen size={15} className="text-amber-400" />
            Guia de uso
          </h2>
          <div className="space-y-5">

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Plus size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">1. Criar uma cifra</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Vá em <strong className="text-gray-400">Cifras</strong> → clique em <strong className="text-gray-400">Nova cifra</strong> → preencha título, artista, tom e BPM. Depois adicione as seções.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <FileText size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">2. Adicionar seções (verso, refrão, ponte...)</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Dentro de uma cifra, clique em <strong className="text-gray-400">Adicionar seção</strong>. Escolha o tipo (Verso, Refrão, Ponte...), escreva a letra e marque os acordes com colchetes.
                </p>
                <div className="mt-2 bg-gray-800 rounded-lg p-3 font-mono text-xs space-y-1">
                  <p className="text-amber-400">G              Em        C</p>
                  <p className="text-gray-300">[G]Senhor és Santo, [Em]digno de [C]louvor</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">Os acordes aparecem automaticamente acima das letras.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Upload size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">3. Importar PDF</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Dentro de uma cifra, clique em <strong className="text-gray-400">Importar PDF</strong>. O sistema detecta automaticamente as seções (Verso, Refrão...) e separa o conteúdo. Você pode revisar e editar antes de salvar.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Mic2 size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">4. Adicionar playback / VS (MP3)</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Dentro de uma cifra, clique em <strong className="text-gray-400">Adicionar playback / VS</strong>. Dê uma descrição (ex: <em>Playback G</em>, <em>VS soprano</em>) e selecione o arquivo MP3. O player aparece na cifra para tocar durante o ensaio.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">5. Biblioteca</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  No menu <strong className="text-gray-400">Biblioteca</strong> você vê todas as músicas em grade e pode filtrar por <strong className="text-gray-400">tom</strong> ou <strong className="text-gray-400">tag</strong> (ex: louvor, adoração, rápida).
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Formato das cifras */}
        <section className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <FileText size={15} className="text-amber-400" />
            Formato das cifras
          </h2>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Use <code className="text-amber-400">[Acorde]</code> antes da sílaba que o acorde toca.</p>
            <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs space-y-1">
              <p className="text-gray-600">{'// Como digitar:'}</p>
              <p className="text-gray-300">[G]Quão grande és tu, [Em]Senhor</p>
              <p className="text-gray-600 mt-2">{'// Como aparece:'}</p>
              <p className="text-amber-400">G                   Em</p>
              <p className="text-gray-300">Quão grande és tu, Senhor</p>
            </div>
          </div>
        </section>

        {/* Banco de dados */}
        <section className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Database size={15} className="text-amber-400" />
            Banco de dados (Supabase)
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Os dados são armazenados no Supabase. Para gerenciar diretamente acesse o dashboard.
          </p>
          <a
            href="https://app.supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Abrir Supabase Dashboard
            <ExternalLink size={11} />
          </a>
        </section>

        {/* Sobre */}
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
