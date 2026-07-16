-- =============================================================
--  Lifestyle · Seguimiento de rutinas por cuenta (panel admin)
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

-- Rutinas fijas (no ocasionales) de una cuenta supervisada.
-- Solo nombre/horario/días/categoría: nunca contenido del registro diario.
create or replace function public.admin_list_routines(target uuid)
returns table (
  id uuid, name text, time_of_day text, weekdays int[],
  is_occasional boolean, subtasks jsonb, category text
)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  if exists (select 1 from public.admins a where a.user_id = target) then
    raise exception 'No autorizado';
  end if;
  return query
  select r.id, r.name, r.time_of_day, r.weekdays, r.is_occasional, r.subtasks, r.category
  from public.routines r
  where r.user_id = target and r.is_occasional = false;
end;
$$;

-- Completados de rutinas de esa cuenta en un rango de fechas.
create or replace function public.admin_list_completions(target uuid, since date)
returns table (routine_id uuid, log_date date, done_subtasks jsonb)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  if exists (select 1 from public.admins a where a.user_id = target) then
    raise exception 'No autorizado';
  end if;
  return query
  select rc.routine_id, rc.log_date, rc.done_subtasks
  from public.routine_completions rc
  where rc.user_id = target and rc.log_date >= since;
end;
$$;

grant execute on function public.admin_list_routines(uuid) to authenticated;
grant execute on function public.admin_list_completions(uuid, date) to authenticated;
