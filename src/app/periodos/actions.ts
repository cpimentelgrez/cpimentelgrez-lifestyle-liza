"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDays } from "@/lib/rutinas";
import type { PeriodType, HealthState } from "@/lib/periods";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// Crea un periodo. Vacaciones/viaje agendan maletas automáticamente;
// "otro" solo guarda el nombre libre que la usuaria escribió.
export async function createPeriod(formData: FormData) {
  const { supabase, user } = await requireUser();

  const type = String(formData.get("type") ?? "") as PeriodType;
  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!["vacaciones", "viaje", "otro"].includes(type) || !startDate || !endDate) {
    redirect("/rutinas");
  }
  if (endDate < startDate) redirect("/rutinas");
  if (type === "otro" && !note) redirect("/rutinas");

  const { error } = await supabase.from("special_periods").insert({
    user_id: user.id,
    type,
    start_date: startDate,
    end_date: endDate,
    note: type === "otro" ? note : null,
  });

  if (error) redirect(`/rutinas?error=${encodeURIComponent(error.message)}`);

  if (type === "vacaciones" || type === "viaje") {
    // Maletas automáticas: preparar el día antes de salir, guardar el día de vuelta.
    await supabase.from("routines").insert([
      {
        user_id: user.id,
        name: "Preparar maletas",
        time_of_day: "noche",
        is_occasional: true,
        category: "hogar",
        scheduled_date: addDays(startDate, -1),
      },
      {
        user_id: user.id,
        name: "Guardar maletas",
        time_of_day: "tarde",
        is_occasional: true,
        category: "hogar",
        scheduled_date: addDays(endDate, 1),
      },
    ]);
  }

  revalidatePath("/rutinas");
  revalidatePath("/");
  redirect("/rutinas");
}

export async function deletePeriod(formData: FormData) {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id") ?? "");
  if (id) {
    await supabase.from("special_periods").delete().eq("id", id).eq("user_id", user.id);
  }

  revalidatePath("/rutinas");
  revalidatePath("/");
  redirect("/rutinas");
}

// Marca (o quita) el estado de salud de hoy.
export async function setHealthState(logDate: string, state: HealthState | null) {
  const { supabase, user } = await requireUser();

  if (state) {
    await supabase
      .from("health_states")
      .upsert(
        { user_id: user.id, log_date: logDate, state },
        { onConflict: "user_id,log_date" },
      );
  } else {
    await supabase
      .from("health_states")
      .delete()
      .eq("user_id", user.id)
      .eq("log_date", logDate);
  }

  revalidatePath("/");
  revalidatePath("/rutinas");
}
