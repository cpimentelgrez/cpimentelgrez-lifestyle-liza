-- =============================================================
--  Lifestyle · Ocasionales programados (fecha específica o mensual)
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

-- Fecha específica única (ej. "armar maletas el 2026-08-05").
alter table public.routines
  add column if not exists scheduled_date date;

-- Día del mes en que se repite (ej. "5" para pagar la tarjeta cada día 5).
alter table public.routines
  add column if not exists monthly_day smallint
    check (monthly_day is null or monthly_day between 1 and 31);
