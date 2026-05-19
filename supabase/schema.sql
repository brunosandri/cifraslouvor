-- CifrasLouvor - Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase (https://app.supabase.com)

-- Tabela de músicas
create table if not exists public.songs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  artist      text,
  key         text,          -- Tom: C, D, G, Am, etc.
  bpm         integer,
  tags        text[] default '{}',
  notes       text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Tabela de seções da música (containers)
create table if not exists public.song_sections (
  id          uuid primary key default gen_random_uuid(),
  song_id     uuid not null references public.songs(id) on delete cascade,
  type        text not null default 'verse',  -- intro, verse, verse1, chorus, bridge...
  title       text not null default '',
  observation text,
  content     text not null default '',       -- letra + cifras com marcação [Acorde]
  order_index integer not null default 0,
  created_at  timestamptz default now() not null
);

-- Tabela de arquivos de áudio (playbacks, VS, etc.)
create table if not exists public.audio_files (
  id          uuid primary key default gen_random_uuid(),
  song_id     uuid not null references public.songs(id) on delete cascade,
  file_url    text not null,
  file_name   text not null,
  description text,
  duration    numeric,       -- duração em segundos
  created_at  timestamptz default now() not null
);

-- Índices
create index if not exists songs_title_idx on public.songs(title);
create index if not exists songs_artist_idx on public.songs(artist);
create index if not exists sections_song_id_idx on public.song_sections(song_id);
create index if not exists sections_order_idx on public.song_sections(song_id, order_index);
create index if not exists audio_song_id_idx on public.audio_files(song_id);

-- Bucket de áudio no Storage
-- Execute separadamente no dashboard Storage ou via API:
-- insert into storage.buckets (id, name, public) values ('audio', 'audio', true);

-- Políticas de acesso (RLS) - descomente e ajuste conforme necessidade
-- Por padrão: acesso público para leitura, autenticado para escrita

-- alter table public.songs enable row level security;
-- alter table public.song_sections enable row level security;
-- alter table public.audio_files enable row level security;

-- Leitura pública
-- create policy "Leitura pública" on public.songs for select using (true);
-- create policy "Leitura pública" on public.song_sections for select using (true);
-- create policy "Leitura pública" on public.audio_files for select using (true);

-- Escrita apenas para autenticados
-- create policy "Escrita autenticada" on public.songs for all using (auth.role() = 'authenticated');
-- create policy "Escrita autenticada" on public.song_sections for all using (auth.role() = 'authenticated');
-- create policy "Escrita autenticada" on public.audio_files for all using (auth.role() = 'authenticated');
