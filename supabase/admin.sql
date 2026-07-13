-- =============================================================
--  Lifestyle · Panel de administración (uso, sin contenido)
--  Ejecuta este script en el SQL Editor de Supabase DESPUÉS de schema.sql
-- =============================================================

-- ------------------------------------------------------------
--  Tabla de administradoras: quién tiene acceso al panel.
-- ------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Cada usuaria solo puede comprobar si ELLA misma es admin (no ver la lista).
drop policy if exists "Ver mi propia fila de admin" on public.admins;
create policy "Ver mi propia fila de admin"
  on public.admins for select
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
--  ¿La usuaria actual es admin?
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
--  Resumen de USO por usuaria (solo conteos y fechas).
--  Nunca devuelve el contenido de los registros (ni notas ni valores).
-- ------------------------------------------------------------
create or replace function public.admin_usage_overview()
returns table (
  user_id          uuid,
  email            text,
  signed_up        timestamptz,
  total_days       bigint,
  last_log_date    date,
  days_last_7      bigint,
  mood_count       bigint,
  energy_count     bigint,
  food_count       bigint,
  anxiety_count    bigint,
  medication_count bigint,
  tasks_count      bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo las admin pueden ejecutar esto.
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    u.id,
    u.email::text,
    u.created_at,
    count(d.id)                                                                    as total_days,
    max(d.log_date)                                                                as last_log_date,
    count(d.id) filter (where d.log_date >= current_date - 6)                      as days_last_7,
    count(d.id) filter (where d.mood is not null)                                  as mood_count,
    count(d.id) filter (where d.energy is not null)                                as energy_count,
    count(d.id) filter (where d.food_rating is not null or d.food_notes is not null) as food_count,
    count(d.id) filter (where d.anxiety is not null)                               as anxiety_count,
    count(d.id) filter (where d.medication_taken is true or d.medication_notes is not null) as medication_count,
    count(d.id) filter (where d.tasks_completion is not null or d.tasks_notes is not null)  as tasks_count
  from auth.users u
  left join public.daily_logs d on d.user_id = u.id
  -- No incluir a las propias administradoras en el listado de seguimiento.
  where u.id not in (select a.user_id from public.admins a)
  group by u.id, u.email, u.created_at
  order by max(d.log_date) desc nulls last;
end;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_usage_overview() to authenticated;
