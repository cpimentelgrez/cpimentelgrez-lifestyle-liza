-- =============================================================
--  Lifestyle · Rutinas: subtareas + progreso de subtareas
--  Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================

-- Lista de subtareas de una rutina (ej. Limpiar -> ["Cocina","Baño"]).
alter table public.routines
  add column if not exists subtasks jsonb not null default '[]'::jsonb;

-- Subtareas ya hechas ese día para una rutina.
alter table public.routine_completions
  add column if not exists done_subtasks jsonb not null default '[]'::jsonb;
