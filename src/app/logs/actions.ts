"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Convierte un valor de formulario a número o null si está vacío.
function num(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s === "" ? null : s;
}

export async function saveDailyLog(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const logDate = str(formData.get("log_date")) ?? new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: user.id,
    log_date: logDate,
    food_notes: str(formData.get("food_notes")),
    food_rating: num(formData.get("food_rating")),
    energy: num(formData.get("energy")),
    mood: num(formData.get("mood")),
    anxiety: num(formData.get("anxiety")),
    medication_taken: formData.get("medication_taken") === "on",
    medication_notes: str(formData.get("medication_notes")),
    tasks_completion: num(formData.get("tasks_completion")),
    tasks_notes: str(formData.get("tasks_notes")),
    notes: str(formData.get("notes")),
  };

  // upsert: si ya existe un registro para ese usuario y día, lo actualiza.
  const { error } = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "user_id,log_date" });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  redirect("/?guardado=1");
}

export async function deleteDailyLog(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = str(formData.get("id"));
  if (id) {
    await supabase.from("daily_logs").delete().eq("id", id).eq("user_id", user.id);
  }

  revalidatePath("/");
  redirect("/");
}
