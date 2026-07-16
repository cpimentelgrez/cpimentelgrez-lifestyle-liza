-- =============================================================
--  Lifestyle · Periodos especiales (vacaciones/viaje) y estado de salud
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

-- ------------------------------------------------------------
--  Periodos: vacaciones o viaje de trabajo (rango de fechas).
-- ------------------------------------------------------------
create table if not exists public.special_periods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       text not null check (type in ('vacaciones', 'viaje')),
  start_date date not null,
  end_date   date not null,
  note       text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists special_periods_user_idx
  on public.special_periods (user_id, start_date);

alter table public.special_periods enable row level security;

drop policy if exists "Periodos: ver los propios" on public.special_periods;
create policy "Periodos: ver los propios"
  on public.special_periods for select using (auth.uid() = user_id);

drop policy if exists "Periodos: crear los propios" on public.special_periods;
create policy "Periodos: crear los propios"
  on public.special_periods for insert with check (auth.uid() = user_id);

drop policy if exists "Periodos: borrar los propios" on public.special_periods;
create policy "Periodos: borrar los propios"
  on public.special_periods for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
--  Estado de salud del día (toggle rápido, sin rango de fechas).
-- ------------------------------------------------------------
create table if not exists public.health_states (
  user_id  uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  state    text not null check (state in ('enferma', 'spm', 'menstruacion')),
  primary key (user_id, log_date)
);

alter table public.health_states enable row level security;

drop policy if exists "Salud: ver la propia" on public.health_states;
create policy "Salud: ver la propia"
  on public.health_states for select using (auth.uid() = user_id);

drop policy if exists "Salud: crear/editar la propia" on public.health_states;
create policy "Salud: crear/editar la propia"
  on public.health_states for insert with check (auth.uid() = user_id);

drop policy if exists "Salud: actualizar la propia" on public.health_states;
create policy "Salud: actualizar la propia"
  on public.health_states for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Salud: borrar la propia" on public.health_states;
create policy "Salud: borrar la propia"
  on public.health_states for delete using (auth.uid() = user_id);
