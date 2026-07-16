import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { logout } from "../login/actions";
import TrendChart, { type Series } from "@/components/TrendChart";
import BottomNav from "@/components/BottomNav";

type Row = {
  log_date: string;
  mood: number | null;
  energy: number | null;
  anxiety: number | null;
};

const WEEKDAY_SHORT = ["D", "L", "M", "X", "J", "V", "S"];

function fmt(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function average(nums: (number | null)[]): number | null {
  const vals = nums.filter((n): n is number => n != null);
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export default async function EvolucionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await isCurrentUserAdmin();
  const today = new Date();
  const since = new Date(today);
  since.setDate(since.getDate() - 29);

  const { data } = await supabase
    .from("daily_logs")
    .select("log_date, mood, energy, anxiety")
    .eq("user_id", user.id)
    .gte("log_date", fmt(since))
    .order("log_date", { ascending: true });

  const rows = (data as Row[]) ?? [];
  const byDate = new Map(rows.map((r) => [r.log_date, r]));

  // Racha: días consecutivos con registro terminando hoy (o ayer).
  const logged = new Set(rows.map((r) => r.log_date));
  let streak = 0;
  const cursor = new Date(today);
  if (!logged.has(fmt(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (logged.has(fmt(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Últimos 14 días para la gráfica.
  const days: string[] = [];
  const moodV: (number | null)[] = [];
  const energyV: (number | null)[] = [];
  const anxietyV: (number | null)[] = [];
  const last7Mood: (number | null)[] = [];
  const last7Energy: (number | null)[] = [];
  const last7Anx: (number | null)[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    const row = byDate.get(key);
    days.push(WEEKDAY_SHORT[d.getDay()]);
    moodV.push(row?.mood ?? null);
    energyV.push(row?.energy ?? null);
    anxietyV.push(row?.anxiety ?? null);
    if (i <= 6) {
      last7Mood.push(row?.mood ?? null);
      last7Energy.push(row?.energy ?? null);
      last7Anx.push(row?.anxiety ?? null);
    }
  }

  const series: Series[] = [
    { label: "😊 Ánimo", color: "#f43f5e", values: moodV },
    { label: "⚡ Energía", color: "#f59e0b", values: energyV },
    { label: "😰 Ansiedad", color: "#8b5cf6", values: anxietyV },
  ];

  const hasData = rows.length > 0;
  const avgMood = average(last7Mood);
  const avgEnergy = average(last7Energy);
  const avgAnx = average(last7Anx);

  return (
    <div className="flex min-h-full flex-col bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-rose-900">Evolución 📈</h1>
            <p className="text-xs text-rose-700/60">Tus últimos días · {user.email}</p>
          </div>
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

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
        {!hasData ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-rose-700/60 shadow-sm ring-1 ring-rose-100">
            Aún no hay suficientes registros para mostrar tu evolución. Cuando lleves
            unos días registrando, aquí verás tus gráficas. 🌱
          </p>
        ) : (
          <>
            {/* Resumen */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-rose-100">
                <p className="text-2xl font-semibold text-rose-900">🔥 {streak}</p>
                <p className="text-xs text-rose-700/60">
                  {streak === 1 ? "día seguido" : "días seguidos"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-rose-100">
                <p className="text-2xl font-semibold text-rose-900">
                  {avgMood ?? "–"}
                </p>
                <p className="text-xs text-rose-700/60">Ánimo (7 días)</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-rose-100">
                <p className="text-2xl font-semibold text-rose-900">
                  {avgEnergy ?? "–"}
                </p>
                <p className="text-xs text-rose-700/60">Energía (7 días)</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-rose-100">
                <p className="text-2xl font-semibold text-rose-900">
                  {avgAnx ?? "–"}
                </p>
                <p className="text-xs text-rose-700/60">Ansiedad (7 días)</p>
              </div>
            </section>

            {/* Gráfica */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
              <h2 className="mb-4 text-lg font-semibold text-rose-900">
                Últimos 14 días
              </h2>
              <TrendChart days={days} series={series} />
              <p className="mt-3 text-xs text-rose-700/50">
                Escala 1–5. Los días sin registro aparecen como huecos.
              </p>
            </section>
          </>
        )}
      </main>

      <BottomNav active="evolucion" admin={admin} />
    </div>
  );
}
