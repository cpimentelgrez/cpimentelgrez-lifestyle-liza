-- =============================================================
--  Lifestyle · Periodos: añadir tipo "Otro" (con nombre libre)
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

alter table public.special_periods drop constraint if exists special_periods_type_check;
alter table public.special_periods
  add constraint special_periods_type_check check (type in ('vacaciones', 'viaje', 'otro'));
