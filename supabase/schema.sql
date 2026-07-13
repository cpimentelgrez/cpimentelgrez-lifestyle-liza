-- =============================================================
--  Lifestyle · Módulo 1: Registro diario
--  Ejecuta este script en el SQL Editor de tu proyecto Supabase.
-- =============================================================

-- Tabla principal: un registro por usuario y por día.
create table if not exists public.daily_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  log_date      date not null default current_date,

  -- Alimentación (texto libre + valoración de cómo comió 1-5)
  food_notes    text,
  food_rating   smallint check (food_rating between 1 and 5),

  -- Energía (1 = muy baja, 5 = muy alta)
  energy        smallint check (energy between 1 and 5),

  -- Ánimo (1 = muy mal, 5 = muy bien)
  mood          smallint check (mood between 1 and 5),

  -- Ansiedad (1 = nada, 5 = muchísima)
  anxiety       smallint check (anxiety between 1 and 5),

  -- Medicación (¿la tomó hoy? + notas)
  medication_taken boolean default false,
  medication_notes text,

  -- Cumplimiento de tareas (0-100 %)
  tasks_completion smallint check (tasks_completion between 0 and 100),
  tasks_notes      text,

  -- Notas generales del día
  notes         text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Un único registro por usuario y día.
  unique (user_id, log_date)
);

-- Índice para consultar el historial de un usuario por fecha.
create index if not exists daily_logs_user_date_idx
  on public.daily_logs (user_id, log_date desc);

-- ------------------------------------------------------------
--  Trigger para mantener updated_at al día.
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists daily_logs_set_updated_at on public.daily_logs;
create trigger daily_logs_set_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
--  Row Level Security: cada usuario solo ve y edita lo suyo.
-- ------------------------------------------------------------
alter table public.daily_logs enable row level security;

drop policy if exists "Los usuarios ven sus propios registros" on public.daily_logs;
create policy "Los usuarios ven sus propios registros"
  on public.daily_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Los usuarios crean sus propios registros" on public.daily_logs;
create policy "Los usuarios crean sus propios registros"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Los usuarios actualizan sus propios registros" on public.daily_logs;
create policy "Los usuarios actualizan sus propios registros"
  on public.daily_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Los usuarios borran sus propios registros" on public.daily_logs;
create policy "Los usuarios borran sus propios registros"
  on public.daily_logs for delete
  using (auth.uid() = user_id);
