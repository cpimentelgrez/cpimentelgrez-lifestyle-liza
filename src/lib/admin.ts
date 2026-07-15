import { createClient } from "@/lib/supabase/server";

// ¿La usuaria actual es administradora? (usa la función is_admin de Supabase)
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

// Fila de uso por usuaria que devuelve admin_usage_overview (solo métricas, sin contenido).
export type UsageRow = {
  user_id: string;
  email: string;
  signed_up: string;
  total_days: number;
  last_log_date: string | null;
  days_last_7: number;
  mood_count: number;
  energy_count: number;
  food_count: number;
  anxiety_count: number;
  medication_count: number;
  tasks_count: number;
  routines_active: number;
  routines_done_7: number;
};

// Días desde el último registro (null si nunca registró).
export function daysSinceLastLog(row: UsageRow): number | null {
  if (!row.last_log_date) return null;
  const last = new Date(row.last_log_date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - last.getTime()) / 86400000);
}

// ¿Conviene "acompañar" a esta cuenta? (inactividad, sin revelar contenido)
export function needsAttention(row: UsageRow): boolean {
  const d = daysSinceLastLog(row);
  if (d === null) {
    // Nunca ha registrado y su cuenta ya tiene algunos días.
    const created = new Date(row.signed_up);
    const ageDays = (Date.now() - created.getTime()) / 86400000;
    return ageDays >= 3;
  }
  return d >= 3;
}
