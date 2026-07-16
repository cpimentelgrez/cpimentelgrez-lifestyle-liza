import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { logout } from "./login/actions";
import BottomNav from "@/components/BottomNav";
import { buildAchievements } from "@/lib/achievements";

export default async function Inicio() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isCurrentUserAdmin();

  // Datos para calcular racha e insignias (solo conteos, sin contenido).
  const [{ data: logRows }, { count: routinesCompleted }, { count: selfCareCompleted }] =
    await Promise.all([
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
    ]);

  const achievements = buildAchievements({
    logDates: (logRows ?? []).map((r: { log_date: string }) => r.log_date),
    routinesCompleted: routinesCompleted ?? 0,
    selfCareCompleted: selfCareCompleted ?? 0,
  });

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

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {/* Bienvenida */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-rose-100 sm:grid sm:grid-cols-2">
          <div className="relative h-72 w-full bg-rose-100 sm:h-full sm:min-h-[300px]">
            <Image
              src="/portada.jpg"
              alt="Portada"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 336px"
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center p-6">
            <h2 className="text-2xl font-semibold text-rose-900">
              ¡Hola de nuevo! 🌷
            </h2>
            <p className="mt-2 text-sm text-rose-700/70">
              ¿Qué quieres hacer hoy? Elige una sección para empezar.
            </p>
          </div>
        </section>

        {/* Logros */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
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

        <p className="mt-8 text-center text-xs text-rose-700/50">
          Sesión iniciada como {user.email}
        </p>
      </main>

      <BottomNav active="inicio" admin={admin} />
    </div>
  );
}
