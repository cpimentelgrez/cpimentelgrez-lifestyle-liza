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
};
