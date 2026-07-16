import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import {
  type Routine,
  type TimeOfDay,
  TIME_LABELS,
  TIME_ORDER,
  isoWeekday,
  isRoutineDone,
  fmtDate,
} from "@/lib/rutinas";

const PERIOD_DAYS = 30;

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-rose-100">
      <div
        className="h-full rounded-full bg-rose-400"
        style={{ width: `${Math.round(pct)}%` }}
      />
    </div>
  );
}

export default async function AdminSeguimientoPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { userId } = await params;
  const { email } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await isCurrentUserAdmin();
  if (!admin) redirect("/");

  const today = new Date();
  const since = new Date(today);
  since.setDate(since.getDate() - (PERIOD_DAYS - 1));
  const sinceStr = fmtDate(since);

  const [{ data: routinesData, error: routinesError }, { data: completionsData }] =
    await Promise.all([
      supabase.rpc("admin_list_routines", { target: userId }),
      supabase.rpc("admin_list_completions", { target: userId, since: sinceStr }),
    ]);

  const routines = (routinesData as Routine[]) ?? [];
  const completions = (completionsData ?? []) as {
    routine_id: string;
    log_date: string;
    done_subtasks: string[];
  }[];

  // routine_id -> log_date -> done_subtasks
  const byRoutineDate = new Map<string, Map<string, string[]>>();
  for (const c of completions) {
    if (!byRoutineDate.has(c.routine_id)) byRoutineDate.set(c.routine_id, new Map());
    byRoutineDate.get(c.routine_id)!.set(c.log_date, c.done_subtasks ?? []);
  }

  const byTime: Record<TimeOfDay, { scheduled: number; done: number }> = {
    manana: { scheduled: 0, done: 0 },
    tarde: { scheduled: 0, done: 0 },
    noche: { scheduled: 0, done: 0 },
  };
  const byRoutine = new Map<string, { name: string; scheduled: number; done: number }>();
  for (const r of routines) byRoutine.set(r.id, { name: r.name, scheduled: 0, done: 0 });

  for (let i = 0; i < PERIOD_DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = fmtDate(d);
    const wd = isoWeekday(d);

    for (const r of routines) {
      if (!r.weekdays.includes(wd)) continue;

      byTime[r.time_of_day].scheduled++;
      const stat = byRoutine.get(r.id)!;
      stat.scheduled++;

      const dateMap = byRoutineDate.get(r.id);
      const hasRow = dateMap?.has(key) ?? false;
      const doneSub = dateMap?.get(key);
      if (isRoutineDone(r, doneSub, hasRow)) {
        byTime[r.time_of_day].done++;
        stat.done++;
      }
    }
  }

  const timeStats = TIME_ORDER.map((t) => ({
    t,
    ...byTime[t],
    rate: byTime[t].scheduled > 0 ? (byTime[t].done / byTime[t].scheduled) * 100 : 0,
  })).sort((a, b) => b.rate - a.rate);

  const ranking = [...byRoutine.values()]
    .filter((s) => s.scheduled > 0)
    .map((s) => ({ ...s, rate: (s.done / s.scheduled) * 100 }))
    .sort((a, b) => b.done - a.done || b.rate - a.rate)
    .slice(0, 8);

  const totalScheduled = ranking.reduce((n, s) => n + s.scheduled, 0);
  const totalDone = [...byRoutine.values()].reduce((n, s) => n + s.done, 0);
  const totalSched2 = [...byRoutine.values()].reduce((n, s) => n + s.scheduled, 0);
  const routineRate = totalSched2 > 0 ? Math.round((totalDone / totalSched2) * 100) : null;

  const hasData = totalSched2 > 0;

  return (
    <div className="flex min-h-full flex-col bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-rose-900">Seguimiento 📊</h1>
            <p className="text-xs text-rose-700/60">
              Últimos {PERIOD_DAYS} días · {email ?? "cuenta supervisada"}
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50"
          >
            ← Panel
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-xs text-rose-700/70">
          Solo se muestra el cumplimiento de rutinas (nombres y horarios). No se
          muestra el contenido del registro diario.
        </p>

        {routinesError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            No se pudo cargar: {routinesError.message}
          </p>
        )}

        {!hasData ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-rose-700/60 shadow-sm ring-1 ring-rose-100">
            Todavía no hay suficiente historial de rutinas para esta cuenta. 🌱
          </p>
        ) : (
          <>
            <section className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-rose-100">
              <p className="text-2xl font-semibold text-rose-900">
                {routineRate ?? "–"}
                {routineRate !== null && "%"}
              </p>
              <p className="mt-1 text-xs text-rose-700/60">💪 Rutinas completadas</p>
            </section>

            {totalScheduled > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
                <h2 className="text-lg font-semibold text-rose-900">
                  ¿En qué horario cumple más?
                </h2>
                <p className="mt-1 text-sm text-rose-700/60">
                  Porcentaje de rutinas completadas según el rango del día.
                </p>
                <div className="mt-4 space-y-3">
                  {timeStats.map((s, i) => (
                    <div key={s.t}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-rose-900">
                          {i === 0 && s.scheduled > 0 ? "🏆 " : ""}
                          {TIME_LABELS[s.t]}
                        </span>
                        <span className="text-rose-700/60">
                          {s.done}/{s.scheduled} · {Math.round(s.rate)}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <Bar pct={s.rate} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {ranking.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
                <h2 className="text-lg font-semibold text-rose-900">
                  Tareas que más cumple
                </h2>
                <p className="mt-1 text-sm text-rose-700/60">
                  Ordenadas por veces completadas en los últimos {PERIOD_DAYS} días.
                </p>
                <div className="mt-4 space-y-3">
                  {ranking.map((s, i) => (
                    <div key={s.name + i}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-rose-900">{s.name}</span>
                        <span className="text-rose-700/60">
                          {s.done}/{s.scheduled} · {Math.round(s.rate)}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <Bar pct={s.rate} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
