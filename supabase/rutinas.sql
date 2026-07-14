-- =============================================================
--  Lifestyle · Módulo 2: "Súper adulta" (rutinas + checklist)
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

-- ------------------------------------------------------------
--  Rutinas: definición de cada tarea (fija u ocasional).
--  weekdays: días de la semana en que se repite (1=Lunes ... 7=Domingo).
--  time_of_day: rango del día (manana / tarde / noche).
--  is_occasional: true = tarea ocasional (no tiene días fijos).
-- ------------------------------------------------------------
create table if not exists public.routines (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  time_of_day   text not null default 'manana' check (time_of_day in ('manana','tarde','noche')),
  weekdays      int[] not null default '{}',
  is_occasional boolean not null default false,
  sort          int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists routines_user_idx on public.routines (user_id);

alter table public.routines enable row level security;

drop policy if exists "Rutinas: ver las propias" on public.routines;
create policy "Rutinas: ver las propias"
  on public.routines for select using (auth.uid() = user_id);

drop policy if exists "Rutinas: crear las propias" on public.routines;
create policy "Rutinas: crear las propias"
  on public.routines for insert with check (auth.uid() = user_id);

drop policy if exists "Rutinas: editar las propias" on public.routines;
create policy "Rutinas: editar las propias"
  on public.routines for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Rutinas: borrar las propias" on public.routines;
create policy "Rutinas: borrar las propias"
  on public.routines for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
--  Completados: una fila = esa rutina se hizo ese día.
-- ------------------------------------------------------------
create table if not exists public.routine_completions (
  routine_id uuid not null references public.routines (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  log_date   date not null default current_date,
  done_at    timestamptz not null default now(),
  primary key (routine_id, log_date)
);

create index if not exists routine_completions_user_date_idx
  on public.routine_completions (user_id, log_date);

alter table public.routine_completions enable row level security;

drop policy if exists "Completados: ver los propios" on public.routine_completions;
create policy "Completados: ver los propios"
  on public.routine_completions for select using (auth.uid() = user_id);

drop policy if exists "Completados: crear los propios" on public.routine_completions;
create policy "Completados: crear los propios"
  on public.routine_completions for insert with check (auth.uid() = user_id);

drop policy if exists "Completados: borrar los propios" on public.routine_completions;
create policy "Completados: borrar los propios"
  on public.routine_completions for delete using (auth.uid() = user_id);
