"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TimeOfDay } from "@/lib/rutinas";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function parseTime(value: FormDataEntryValue | null): TimeOfDay {
  const v = String(value ?? "");
  return v === "tarde" || v === "noche" ? v : "manana";
}

// Días seleccionados (checkboxes name="weekdays" value=1..7).
function parseWeekdays(formData: FormData): number[] {
  return formData
    .getAll("weekdays")
    .map((d) => Number(d))
    .filter((n) => n >= 1 && n <= 7);
}

export async function addRoutine(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/rutinas");

  const isOccasional = formData.get("is_occasional") === "on";
  const weekdays = isOccasional ? [] : parseWeekdays(formData);

  const { error } = await supabase.from("routines").insert({
    user_id: user.id,
    name,
    time_of_day: parseTime(formData.get("time_of_day")),
    weekdays,
    is_occasional: isOccasional,
  });

  if (error) redirect(`/rutinas?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/rutinas");
  redirect("/rutinas");
}

export async function deleteRoutine(formData: FormData) {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id") ?? "");
  if (id) {
    await supabase.from("routines").delete().eq("id", id).eq("user_id", user.id);
  }

  revalidatePath("/rutinas");
  redirect("/rutinas");
}

// Marca o desmarca una rutina como hecha en una fecha.
export async function toggleCompletion(
  routineId: string,
  logDate: string,
  makeDone: boolean,
) {
  const { supabase, user } = await requireUser();

  if (makeDone) {
    await supabase
      .from("routine_completions")
      .upsert(
        { routine_id: routineId, user_id: user.id, log_date: logDate },
        { onConflict: "routine_id,log_date" },
      );
  } else {
    await supabase
      .from("routine_completions")
      .delete()
      .eq("routine_id", routineId)
      .eq("log_date", logDate)
      .eq("user_id", user.id);
  }

  revalidatePath("/rutinas");
}
