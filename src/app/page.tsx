import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { logout } from "./login/actions";
import BottomNav from "@/components/BottomNav";
import HealthToggle from "@/components/HealthToggle";
import { buildAchievements } from "@/lib/achievements";
import { todayStr } from "@/lib/rutinas";
import {
  type SpecialPeriod,
  type HealthState,
  PERIOD_LABELS,
  isDateInPeriod,
  daysUntil,
} from "@/lib/periods";

export default async function Inicio() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isCurrentUserAdmin();
  const today = todayStr();

  // Datos para calcular racha e insignias (solo conteos, sin contenido).
  const [
    { data: logRows },
    { count: routinesCompleted },
    { count: selfCareCompleted },
    { data: periodsData },
    { data: healthRow },
  ] = await Promise.all([
    supabase.from("daily_logs").select("log_date").eq("user_id", user.id),
    supabase
      .from("routine_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("routine_completions")
      .select("routine_id, routines!inner(category)", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("routines.category", "autocuidado"),
    supabase
      .from("special_periods")
      .select("id, type, start_date, end_date, note")
      .eq("user_id", user.id)
      .gte("end_date", today)
      .order("start_date", { ascending: true }),
    supabase
      .from("health_states")
      .select("state")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
  ]);

  const achievements = buildAchievements({
    logDates: (logRows ?? []).map((r: { log_date: string }) => r.log_date),
    routinesCompleted: routinesCompleted ?? 0,
    selfCareCompleted: selfCareCompleted ?? 0,
  });

  const periods = (periodsData as SpecialPeriod[]) ?? [];
  const activePeriod = periods.find((p) => isDateInPeriod(p, today));
  const upcomingPeriods = periods.filter((p) => {
    const d = daysUntil(p.start_date, today);
    return d > 0 && d <= 7;
  });
  const currentHealth = (healthRow?.state as HealthState | undefined) ?? null;

  return (
    <div className="flex min-h-full flex-col bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-rose-900">Lifestyle 🌸</h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {/* Bienvenida compacta: foto pequeña al costado */}
        <section className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-rose-100">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-rose-100 ring-2 ring-rose-200">
            <Image
              src="/portada.jpg"
              alt="Portada"
              fill
              priority
              sizes="64px"
              className="object-cover object-center"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rose-900">¡Hola de nuevo! 🌷</h2>
            <p className="text-sm text-rose-700/70">¿Qué quieres hacer hoy?</p>
          </div>
        </section>

        {/* Próximamente: periodos y estado de salud */}
        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-rose-100">
          <h3 className="text-sm font-semibold text-rose-900">Próximamente</h3>

          <div className="mt-3 space-y-2">
            {activePeriod && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {PERIOD_LABELS[activePeriod.type]} hasta{" "}
                {new Date(activePeriod.end_date + "T00:00:00").toLocaleDateString(
                  "es-ES",
                  { day: "numeric", month: "long" },
                )}
              </div>
            )}

            {upcomingPeriods.map((p) => (
              <div
                key={p.id}
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800"
              >
                En {daysUntil(p.start_date, today)}{" "}
                {daysUntil(p.start_date, today) === 1 ? "día" : "días"}:{" "}
                {PERIOD_LABELS[p.type]}
              </div>
            ))}

            {currentHealth && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
                Modo cuidado activado hoy — no te exijas 💗
              </div>
            )}

            {!activePeriod && upcomingPeriods.length === 0 && !currentHealth && (
              <p className="text-sm text-rose-700/60">
                Nada especial por ahora. Agenda vacaciones o viajes en Rutinas → Configurar.
              </p>
            )}
          </div>

          <div className="mt-4 border-t border-rose-100 pt-4">
            <HealthToggle today={today} current={currentHealth} />
          </div>
        </section>

        {/* Logros */}
        <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-rose-700/70">Tu racha actual</p>
              <p className="text-3xl font-semibold text-rose-900">
                🔥 {achievements.currentStreak}{" "}
                {achievements.currentStreak === 1 ? "día" : "días"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-rose-700/60">Récord</p>
              <p className="text-lg font-semibold text-rose-900">
                {achievements.bestStreak} días
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {achievements.badges.map((b) => (
              <div
                key={b.id}
                title={b.description}
                className={`flex flex-col items-center gap-1 rounded-xl p-3 text-center transition ${
                  b.unlocked ? "bg-rose-50" : "bg-gray-50 opacity-50"
                }`}
              >
                <span className="text-2xl">{b.emoji}</span>
                <span
                  className={`text-[11px] font-medium ${
                    b.unlocked ? "text-rose-800" : "text-gray-500"
                  }`}
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-rose-700/50">
            {achievements.totalDays} días registrados en total · {achievements.routinesCompleted}{" "}
            rutinas completadas
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-rose-700/50">
          Sesión iniciada como {user.email}
        </p>
      </main>

      <BottomNav active="inicio" admin={admin} />
    </div>
  );
}
