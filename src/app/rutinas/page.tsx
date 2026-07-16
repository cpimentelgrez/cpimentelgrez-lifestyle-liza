import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { logout } from "../login/actions";
import { moveRoutine } from "./actions";
import CompletionToggle from "@/components/CompletionToggle";
import SubtaskChecklist from "@/components/SubtaskChecklist";
import OccasionalChip from "@/components/OccasionalChip";
import RoutineEditor from "@/components/RoutineEditor";
import AddRoutineForm from "@/components/AddRoutineForm";
import Tabs from "@/components/Tabs";
import BottomNav from "@/components/BottomNav";
import {
  type Routine,
  type TimeOfDay,
  DEFAULT_ROUTINES,
  TIME_LABELS,
  TIME_ORDER,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  WEEKDAY_SHORT,
  WEEKDAY_LONG,
  isoWeekday,
  isRoutineDone,
  occasionalDueOn,
  hasSchedule,
  addDays,
  todayStr,
} from "@/lib/rutinas";

const ROUTINE_SELECT =
  "id, name, time_of_day, weekdays, is_occasional, sort, subtasks, category, scheduled_date, monthly_day";

export default async function RutinasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await isCurrentUserAdmin();
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
        subtasks: r.subtasks,
        category: r.category,
        scheduled_date: r.scheduled_date,
        monthly_day: r.monthly_day,
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
    .select("routine_id, done_subtasks")
    .eq("user_id", user.id)
    .eq("log_date", today);

  const completions = (completionsData ?? []) as {
    routine_id: string;
    done_subtasks: string[];
  }[];
  const rowExists = new Set(completions.map((c) => c.routine_id));
  const doneSubtasks = new Map(
    completions.map((c) => [c.routine_id, c.done_subtasks ?? []]),
  );

  // ¿Una rutina cuenta como hecha hoy?
  function routineDone(r: Routine): boolean {
    return isRoutineDone(r, doneSubtasks.get(r.id), rowExists.has(r.id));
  }

  const fixed = routines.filter((r) => !r.is_occasional);
  const occasional = routines.filter((r) => r.is_occasional);

  const tomorrow = addDays(today, 1);
  // Ocasionales programados (fecha o mensual) que tocan hoy: se incorporan
  // al checklist normal y cuentan como pendientes del día.
  const occasionalDueToday = occasional.filter(
    (r) => hasSchedule(r) && occasionalDueOn(r, today),
  );
  // Recordatorio: programados que tocan mañana (aviso, no se marcan hoy).
  const occasionalReminder = occasional.filter(
    (r) => hasSchedule(r) && occasionalDueOn(r, tomorrow),
  );
  // Ocasionales sin fecha: quedan como chips manuales de "cuando toque".
  const occasionalFreeform = occasional.filter((r) => !hasSchedule(r));
  const occasionalChips = occasionalFreeform.filter((r) => r.subtasks.length === 0);
  const occasionalWithSubtasks = occasionalFreeform.filter((r) => r.subtasks.length > 0);
  const dueTodayIds = new Set(occasionalDueToday.map((r) => r.id));

  // Rutinas de hoy (según el día de la semana), agrupadas por rango horario.
  // Se suman los ocasionales programados que tocan hoy.
  const todaysByTime: Record<TimeOfDay, Routine[]> = {
    manana: [],
    tarde: [],
    noche: [],
  };
  for (const r of fixed) {
    if (r.weekdays.includes(weekday)) todaysByTime[r.time_of_day].push(r);
  }
  for (const r of occasionalDueToday) {
    todaysByTime[r.time_of_day].push(r);
  }

  const todaysList = TIME_ORDER.flatMap((t) => todaysByTime[t]);
  const totalHoy = todaysList.length;
  const hechasHoy = todaysList.filter(routineDone).length;

  // Renderiza un ítem del checklist (con o sin subtareas).
  function renderItem(r: Routine, occasionalStyle = false) {
    if (r.subtasks.length > 0) {
      return (
        <SubtaskChecklist
          key={r.id}
          routineId={r.id}
          logDate={today}
          name={r.name}
          subtasks={r.subtasks}
          done={doneSubtasks.get(r.id) ?? []}
          occasional={occasionalStyle}
        />
      );
    }
    return (
      <CompletionToggle
        key={r.id}
        routineId={r.id}
        logDate={today}
        done={rowExists.has(r.id)}
        label={r.name}
        occasional={occasionalStyle}
      />
    );
  }

  // Caja de reordenamiento + editor para un grupo (usado en "Configurar").
  function editableGroup(list: Routine[], scope: string) {
    return (
      <ul className="mt-4 space-y-3">
        {list.map((r, index) => (
          <li key={r.id} className="flex gap-2">
            <div className="flex flex-col pt-1">
              <form action={moveRoutine}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="dir" value="up" />
                <input type="hidden" name="scope" value={scope} />
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
                <input type="hidden" name="scope" value={scope} />
                <button
                  type="submit"
                  disabled={index === list.length - 1}
                  aria-label="Bajar"
                  className="flex h-5 w-5 items-center justify-center text-rose-400 transition hover:text-rose-600 disabled:opacity-25"
                >
                  ▼
                </button>
              </form>
            </div>
            <div className="flex-1">
              <RoutineEditor routine={r} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const hoyContent = (
    <>
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

        {totalHoy === 0 ? (
          <p className="mt-4 text-sm text-rose-700/60">
            Hoy no tienes rutinas fijas. Añádelas en la pestaña “Configurar”. 🌱
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
                    {todaysByTime[t].map((r) => renderItem(r, dueTodayIds.has(r.id)))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}

        {/* Recordatorio: ocasionales programados que tocan mañana. */}
        {occasionalReminder.length > 0 && (
          <div className="mt-6 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            🔔 Mañana toca:{" "}
            <span className="font-medium">
              {occasionalReminder.map((r) => r.name).join(", ")}
            </span>
          </div>
        )}

        {/* Ocasionales sin fecha: chips rápidos, en color ámbar, para cuando toquen. */}
        {occasionalFreeform.length > 0 && (
          <div className="mt-6 border-t border-rose-100 pt-5">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-800">
              📦 Ocasionales
            </p>
            {occasionalChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {occasionalChips.map((r) => (
                  <OccasionalChip
                    key={r.id}
                    routineId={r.id}
                    logDate={today}
                    done={rowExists.has(r.id)}
                    label={r.name}
                  />
                ))}
              </div>
            )}
            {occasionalWithSubtasks.length > 0 && (
              <div className="mt-2 space-y-2">
                {occasionalWithSubtasks.map((r) => renderItem(r, true))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Vista semanal completa */}
      {fixed.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
          <h2 className="text-lg font-semibold text-rose-900">Vista semanal</h2>
          <p className="mt-1 text-sm text-rose-700/60">
            Qué rutina toca cada día de la semana.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-rose-700/70">Tarea</th>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <th
                      key={d}
                      className={`p-2 text-center font-medium ${
                        d === weekday
                          ? "rounded-t-md bg-rose-100 text-rose-800"
                          : "text-rose-700/70"
                      }`}
                    >
                      {WEEKDAY_SHORT[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fixed.map((r) => (
                  <tr key={r.id} className="border-t border-rose-100">
                    <td className="p-2 text-rose-900">{r.name}</td>
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <td
                        key={d}
                        className={`p-2 text-center ${d === weekday ? "bg-rose-50" : ""}`}
                      >
                        {r.weekdays.includes(d) ? (
                          <span className="inline-block h-3 w-3 rounded-full bg-rose-400" />
                        ) : (
                          <span className="inline-block h-3 w-3 rounded-full bg-rose-100" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );

  const configurarContent = (
    <>
      {CATEGORY_ORDER.map((cat) => {
        const list = fixed.filter((r) => r.category === cat);
        return (
          <section
            key={cat}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100"
          >
            <h2 className="text-lg font-semibold text-rose-900">
              {CATEGORY_LABELS[cat]}
            </h2>
            {list.length === 0 ? (
              <p className="mt-2 text-sm text-rose-700/60">Sin tareas aquí todavía.</p>
            ) : (
              editableGroup(list, cat)
            )}
          </section>
        );
      })}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-100">
        <h2 className="text-lg font-semibold text-amber-900">📦 Ocasionales</h2>
        {occasional.length === 0 ? (
          <p className="mt-2 text-sm text-amber-700/60">Sin tareas aquí todavía.</p>
        ) : (
          editableGroup(occasional, "ocasional")
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
        <h2 className="text-lg font-semibold text-rose-900">Añadir tarea</h2>
        <div className="mt-4 rounded-xl bg-rose-50/60 p-4">
          <AddRoutineForm />
        </div>
      </section>
    </>
  );

  return (
    <div className="flex min-h-full flex-col bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-rose-900">Súper adulta 💪</h1>
            <p className="text-xs text-rose-700/60">Rutinas y tareas · {user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/rutinas/seguimiento"
              className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
            >
              📊 Seguimiento
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Tabs
          tabs={[
            { id: "hoy", label: "📅 Hoy", content: hoyContent },
            { id: "configurar", label: "⚙️ Configurar", content: configurarContent },
          ]}
        />
      </main>

      <BottomNav active="rutinas" admin={admin} />
    </div>
  );
}
