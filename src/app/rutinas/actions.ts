"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TimeOfDay, Category } from "@/lib/rutinas";

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

function parseCategory(value: FormDataEntryValue | null): Category {
  return String(value ?? "") === "autocuidado" ? "autocuidado" : "hogar";
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
    category: parseCategory(formData.get("category")),
  });

  if (error) redirect(`/rutinas?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/rutinas");
  redirect("/rutinas");
}

// Sube o baja una rutina en el orden (columna sort), dentro de su mismo
// grupo (scope = "ocasional" o una categoría) para no mezclar cajas.
export async function moveRoutine(formData: FormData) {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  const scope = String(formData.get("scope") ?? "");
  if (!id || (dir !== "up" && dir !== "down")) redirect("/rutinas");

  const { data } = await supabase
    .from("routines")
    .select("id, sort, is_occasional, category")
    .eq("user_id", user.id)
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });

  let list = (data ?? []) as {
    id: string;
    sort: number;
    is_occasional: boolean;
    category: string;
  }[];

  if (scope === "ocasional") {
    list = list.filter((r) => r.is_occasional);
  } else if (scope) {
    list = list.filter((r) => !r.is_occasional && r.category === scope);
  }

  const i = list.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;

  // Si es válido, intercambia el valor de orden entre las dos filas.
  if (i !== -1 && j >= 0 && j < list.length) {
    await Promise.all([
      supabase
        .from("routines")
        .update({ sort: list[j].sort })
        .eq("id", list[i].id)
        .eq("user_id", user.id),
      supabase
        .from("routines")
        .update({ sort: list[i].sort })
        .eq("id", list[j].id)
        .eq("user_id", user.id),
    ]);
  }

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

// Añade o quita un día (1..7) de una rutina.
export async function toggleRoutineDay(routineId: string, weekday: number) {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("routines")
    .select("weekdays")
    .eq("id", routineId)
    .eq("user_id", user.id)
    .maybeSingle();

  const current: number[] = (data?.weekdays as number[]) ?? [];
  const next = current.includes(weekday)
    ? current.filter((d) => d !== weekday)
    : [...current, weekday].sort((a, b) => a - b);

  await supabase
    .from("routines")
    .update({ weekdays: next })
    .eq("id", routineId)
    .eq("user_id", user.id);

  revalidatePath("/rutinas");
}

// Cambia el nombre de una rutina.
export async function renameRoutine(routineId: string, name: string) {
  const { supabase, user } = await requireUser();
  const clean = name.trim();
  if (!clean) return;

  await supabase
    .from("routines")
    .update({ name: clean })
    .eq("id", routineId)
    .eq("user_id", user.id);

  revalidatePath("/rutinas");
}

// Cambia el rango horario de una rutina.
export async function setRoutineTime(routineId: string, time: TimeOfDay) {
  const { supabase, user } = await requireUser();
  const value: TimeOfDay = time === "tarde" || time === "noche" ? time : "manana";

  await supabase
    .from("routines")
    .update({ time_of_day: value })
    .eq("id", routineId)
    .eq("user_id", user.id);

  revalidatePath("/rutinas");
}

// Cambia la categoría de una rutina (hogar / autocuidado).
export async function setRoutineCategory(routineId: string, category: Category) {
  const { supabase, user } = await requireUser();
  const value: Category = category === "autocuidado" ? "autocuidado" : "hogar";

  await supabase
    .from("routines")
    .update({ category: value })
    .eq("id", routineId)
    .eq("user_id", user.id);

  revalidatePath("/rutinas");
}

// Añade una subtarea a una rutina.
export async function addSubtask(routineId: string, name: string) {
  const { supabase, user } = await requireUser();
  const clean = name.trim();
  if (!clean) return;

  const { data } = await supabase
    .from("routines")
    .select("subtasks")
    .eq("id", routineId)
    .eq("user_id", user.id)
    .maybeSingle();

  const current: string[] = (data?.subtasks as string[]) ?? [];
  if (current.includes(clean)) return;

  await supabase
    .from("routines")
    .update({ subtasks: [...current, clean] })
    .eq("id", routineId)
    .eq("user_id", user.id);

  revalidatePath("/rutinas");
}

// Quita una subtarea de una rutina.
export async function removeSubtask(routineId: string, name: string) {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("routines")
    .select("subtasks")
    .eq("id", routineId)
    .eq("user_id", user.id)
    .maybeSingle();

  const current: string[] = (data?.subtasks as string[]) ?? [];

  await supabase
    .from("routines")
    .update({ subtasks: current.filter((s) => s !== name) })
    .eq("id", routineId)
    .eq("user_id", user.id);

  revalidatePath("/rutinas");
}

// Marca o desmarca una subtarea como hecha en una fecha.
export async function toggleSubtask(
  routineId: string,
  logDate: string,
  name: string,
) {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("routine_completions")
    .select("done_subtasks")
    .eq("routine_id", routineId)
    .eq("log_date", logDate)
    .maybeSingle();

  const current: string[] = (data?.done_subtasks as string[]) ?? [];
  const next = current.includes(name)
    ? current.filter((s) => s !== name)
    : [...current, name];

  if (next.length > 0) {
    await supabase.from("routine_completions").upsert(
      {
        routine_id: routineId,
        user_id: user.id,
        log_date: logDate,
        done_subtasks: next,
      },
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
