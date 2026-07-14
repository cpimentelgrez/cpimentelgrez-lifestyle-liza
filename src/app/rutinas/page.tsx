import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import { deleteRoutine, moveRoutine } from "./actions";
import CompletionToggle from "@/components/CompletionToggle";
import AddRoutineForm from "@/components/AddRoutineForm";
import {
  type Routine,
  type TimeOfDay,
  DEFAULT_ROUTINES,
  TIME_LABELS,
  TIME_ORDER,
  WEEKDAY_SHORT,
  WEEKDAY_LONG,
  isoWeekday,
  todayStr,
} from "@/lib/rutinas";

const ROUTINE_SELECT = "id, name, time_of_day, weekdays, is_occasional, sort";

export default async function RutinasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = todayStr();
  const weekday = isoWeekday(new Date());

  const { data: routinesData } = await supabase
    .from("routines")
    .select(ROUTINE_SELECT)
    .eq("user_id", user.id)
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });

  let routines = (routinesData as Routine[]) ?? [];

  // La primera vez (sin ninguna tarea) se cargan las tareas sugeridas.
  if (routines.length === 0) {
    await supabase.from("routines").insert(
      DEFAULT_ROUTINES.map((r, i) => ({
        user_id: user.id,
        name: r.name,
        time_of_day: r.time_of_day,
        weekdays: r.weekdays,
        is_occasional: r.is_occasional,
        sort: i,
      })),
    );
    const { data } = await supabase
      .from("routines")
      .select(ROUTINE_SELECT)
      .eq("user_id", user.id)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true });
    routines = (data as Routine[]) ?? [];
  }

  const { data: completionsData } = await supabase
    .from("routine_completions")
    .select("routine_id")
    .eq("user_id", user.id)
    .eq("log_date", today);

  const doneToday = new Set(
    (completionsData ?? []).map((c: { routine_id: string }) => c.routine_id),
  );

  const fixed = routines.filter((r) => !r.is_occasional);
  const occasional = routines.filter((r) => r.is_occasional);

  // Rutinas de hoy (según el día de la semana), agrupadas por rango horario.
  const todaysByTime: Record<TimeOfDay, Routine[]> = {
    manana: [],
    tarde: [],
    noche: [],
  };
  for (const r of fixed) {
    if (r.weekdays.includes(weekday)) todaysByTime[r.time_of_day].push(r);
  }

  const totalHoy = TIME_ORDER.reduce((n, t) => n + todaysByTime[t].length, 0);
  const hechasHoy = TIME_ORDER.reduce(
    (n, t) => n + todaysByTime[t].filter((r) => doneToday.has(r.id)).length,
    0,
  );

  return (
    <div className="min-h-full bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-rose-900">Súper adulta 🧹</h1>
            <p className="text-xs text-rose-700/60">Rutinas y tareas · {user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              🏠 Inicio
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        {/* Checklist de hoy */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-rose-900">
              Hoy · {WEEKDAY_LONG[weekday]}
            </h2>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
              {hechasHoy}/{totalHoy}
            </span>
          </div>

          {totalHoy === 0 && occasional.length === 0 ? (
            <p className="mt-4 text-sm text-rose-700/60">
              No hay tareas para hoy todavía. Añádelas abajo en “Mi horario semanal”. 🌱
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {TIME_ORDER.map((t) =>
                todaysByTime[t].length > 0 ? (
                  <div key={t}>
                    <p className="mb-2 text-sm font-semibold text-rose-800">
                      {TIME_LABELS[t]}
                    </p>
                    <div className="space-y-2">
                      {todaysByTime[t].map((r) => (
                        <CompletionToggle
                          key={r.id}
                          routineId={r.id}
                          logDate={today}
                          done={doneToday.has(r.id)}
                          label={r.name}
                        />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}

              {occasional.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-rose-800">
                    📦 Ocasionales
                  </p>
                  <div className="space-y-2">
                    {occasional.map((r) => (
                      <CompletionToggle
                        key={r.id}
                        routineId={r.id}
                        logDate={today}
                        done={doneToday.has(r.id)}
                        label={r.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Horario semanal / gestor de rutinas */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
          <h2 className="text-lg font-semibold text-rose-900">Mi horario semanal</h2>
          <p className="mt-1 text-sm text-rose-700/60">
            Define tus rutinas y en qué días toca cada una.
          </p>

          {routines.length > 0 && (
            <ul className="mt-4 space-y-2">
              {routines.map((r, index) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-rose-100 px-3 py-2"
                >
                  {/* Botones de ordenar */}
                  <div className="flex flex-col">
                    <form action={moveRoutine}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button
                        type="submit"
                        disabled={index === 0}
                        aria-label="Subir"
                        className="flex h-5 w-5 items-center justify-center text-rose-400 transition hover:text-rose-600 disabled:opacity-25"
                      >
                        ▲
                      </button>
                    </form>
                    <form action={moveRoutine}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button
                        type="submit"
                        disabled={index === routines.length - 1}
                        aria-label="Bajar"
                        className="flex h-5 w-5 items-center justify-center text-rose-400 transition hover:text-rose-600 disabled:opacity-25"
                      >
                        ▼
                      </button>
                    </form>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-rose-900">
                      {r.name}
                    </p>
                    <p className="text-xs text-rose-700/60">
                      {TIME_LABELS[r.time_of_day]} ·{" "}
                      {r.is_occasional
                        ? "Ocasional"
                        : r.weekdays.length === 7
                          ? "Todos los días"
                          : r.weekdays
                              .slice()
                              .sort((a, b) => a - b)
                              .map((d) => WEEKDAY_SHORT[d])
                              .join(" ") || "Sin días"}
                    </p>
                  </div>
                  <form action={deleteRoutine}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="shrink-0 text-xs text-rose-400 hover:text-rose-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 rounded-xl bg-rose-50/60 p-4">
            <AddRoutineForm />
          </div>
        </section>
      </main>
    </div>
  );
}
