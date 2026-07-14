import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { logout } from "./login/actions";
import DailyLogForm, { type DailyLog } from "@/components/DailyLogForm";
import LogHistory from "@/components/LogHistory";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ guardado?: string; error?: string }>;
}) {
  const { guardado, error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege la ruta, pero por seguridad:
  if (!user) {
    redirect("/login");
  }

  const admin = await isCurrentUserAdmin();

  const today = new Date().toISOString().slice(0, 10);

  // Registro de hoy (si existe) y los últimos 30 días de historial.
  const { data: todayLog } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .maybeSingle();

  const { data: history } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .neq("log_date", today)
    .order("log_date", { ascending: false })
    .limit(30);

  // Medicamentos a mostrar: los de hoy si ya hay registro; si no, se copian
  // del último día registrado para no tener que reescribirlos cada día.
  const initialMedications =
    (todayLog as DailyLog | null)?.medications ??
    (history as DailyLog[] | null)?.[0]?.medications ??
    [];

  return (
    <div className="min-h-full bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-rose-900">Mi registro diario 🌸</h1>
            <p className="text-xs text-rose-700/60">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/rutinas"
              className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
            >
              🧹 Súper adulta
            </Link>
            {admin && (
              <Link
                href="/admin"
                className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
              >
                🛡️ Panel
              </Link>
            )}
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
        {guardado && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            ¡Registro guardado! 🎉
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
          <h2 className="mb-1 text-xl font-semibold text-rose-900">¿Cómo estás hoy?</h2>
          <p className="mb-5 text-sm text-rose-700/60">
            {todayLog
              ? "Ya guardaste un registro hoy. Puedes editarlo cuando quieras."
              : "Rellena lo que quieras. Nada es obligatorio."}
          </p>
          <DailyLogForm
            today={today}
            existing={(todayLog as DailyLog) ?? null}
            initialMedications={initialMedications}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-rose-900">Historial</h2>
          <LogHistory logs={(history as DailyLog[]) ?? []} />
        </section>
      </main>
    </div>
  );
}
