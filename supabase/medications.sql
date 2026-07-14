-- =============================================================
--  Lifestyle · Medicación estructurada (fármaco, dosis, horario)
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

-- Nueva columna: lista de medicamentos del día.
-- Cada elemento: { "name": "...", "dose": "...", "schedule": "..." }
alter table public.daily_logs
  add column if not exists medications jsonb not null default '[]'::jsonb;

-- ------------------------------------------------------------
--  Actualizar el panel de uso para que "medicación" también
--  cuente cuando se han añadido medicamentos a la lista.
-- ------------------------------------------------------------
create or replace function public.admin_usage_overview()
returns table (
  user_id uuid, email text, signed_up timestamptz, total_days bigint,
  last_log_date date, days_last_7 bigint, mood_count bigint, energy_count bigint,
  food_count bigint, anxiety_count bigint, medication_count bigint, tasks_count bigint
) language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  return query
  select u.id, u.email::text, u.created_at,
    count(d.id),
    max(d.log_date),
    count(d.id) filter (where d.log_date >= current_date - 6),
    count(d.id) filter (where d.mood is not null),
    count(d.id) filter (where d.energy is not null),
    count(d.id) filter (where d.food_rating is not null or d.food_notes is not null),
    count(d.id) filter (where d.anxiety is not null),
    count(d.id) filter (where d.medication_taken is true or d.medication_notes is not null or jsonb_array_length(d.medications) > 0),
    count(d.id) filter (where d.tasks_completion is not null or d.tasks_notes is not null)
  from auth.users u
  left join public.daily_logs d on d.user_id = u.id
  where u.id not in (select a.user_id from public.admins a)
  group by u.id, u.email, u.created_at
  order by max(d.log_date) desc nulls last;
end;
$$;
