-- =============================================================
--  Lifestyle · "Agregar a hoy" para ocasionales sin fecha
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

create table if not exists public.routine_picks (
  routine_id uuid not null references public.routines (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  log_date   date not null,
  created_at timestamptz not null default now(),
  primary key (routine_id, log_date)
);

create index if not exists routine_picks_user_date_idx
  on public.routine_picks (user_id, log_date);

alter table public.routine_picks enable row level security;

drop policy if exists "Picks: ver los propios" on public.routine_picks;
create policy "Picks: ver los propios"
  on public.routine_picks for select using (auth.uid() = user_id);

drop policy if exists "Picks: crear los propios" on public.routine_picks;
create policy "Picks: crear los propios"
  on public.routine_picks for insert with check (auth.uid() = user_id);

drop policy if exists "Picks: borrar los propios" on public.routine_picks;
create policy "Picks: borrar los propios"
  on public.routine_picks for delete using (auth.uid() = user_id);
