-- =============================================================
--  Lifestyle · Rutinas: categoría (hogar / autocuidado)
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

alter table public.routines
  add column if not exists category text not null default 'hogar'
    check (category in ('hogar', 'autocuidado'));

-- Categorización inicial razonable para rutinas ya existentes.
update public.routines set category = 'autocuidado' where name ilike '%gimnasio%';
