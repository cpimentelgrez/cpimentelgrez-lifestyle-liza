import Link from "next/link";
import { type UsageRow, daysSinceLastLog, needsAttention } from "@/lib/admin";

// Barra de "uso" de un área: muestra cuántos días se ha rellenado (no el contenido).
function AreaBar({
  label,
  emoji,
  count,
  total,
}: {
  label: string;
  emoji: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const used = count > 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className={used ? "text-rose-900" : "text-rose-300"}>
          {emoji} {label}
        </span>
        <span className={used ? "font-semibold text-rose-700" : "text-rose-300"}>
          {count}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-rose-100">
        <div
          className={`h-full rounded-full ${used ? "bg-rose-400" : "bg-transparent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function daysAgo(dateStr: string | null): string {
  if (!dateStr) return "Sin actividad";
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return `Hace ${diff} días`;
}

export default function UsageCard({ row }: { row: UsageRow }) {
  const total = row.total_days;
  const active = total > 0;

  // Estado de actividad reciente (últimos 7 días).
  const recent = row.days_last_7;
  const statusColor =
    recent >= 4
      ? "bg-green-100 text-green-800"
      : recent >= 1
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-500";
  const statusText =
    recent >= 4 ? "Activa" : recent >= 1 ? "Poca actividad" : "Inactiva";

  const care = needsAttention(row);
  const dSince = daysSinceLastLog(row);

  return (
    <li
      className={`rounded-2xl bg-white p-5 ring-1 ${
        care ? "ring-rose-300" : "ring-rose-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-rose-900">{row.email}</p>
          <p className="text-xs text-rose-700/60">
            {active
              ? `${total} día${total === 1 ? "" : "s"} registrados · última: ${daysAgo(row.last_log_date)}`
              : "Nunca ha registrado nada"}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {care && (
        <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-200">
          💗 Necesita cariño ·{" "}
          {dSince === null
            ? "aún no ha registrado nada"
            : `sin registrar hace ${dSince} días`}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
        <AreaBar label="Ánimo" emoji="😊" count={row.mood_count} total={total} />
        <AreaBar label="Energía" emoji="⚡" count={row.energy_count} total={total} />
        <AreaBar label="Alimentación" emoji="🍽️" count={row.food_count} total={total} />
        <AreaBar label="Ansiedad" emoji="😰" count={row.anxiety_count} total={total} />
        <AreaBar label="Medicación" emoji="💊" count={row.medication_count} total={total} />
        <AreaBar label="Tareas" emoji="✅" count={row.tasks_count} total={total} />
      </div>

      {row.routines_active > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-rose-50/70 px-3 py-2 text-xs text-rose-800">
          <div>
            <span>💪 Rutinas</span>{" "}
            <span className="font-semibold">{row.routines_done_7} completadas</span>{" "}
            <span className="text-rose-700/50">
              (últimos 7 días · {row.routines_active} activas)
            </span>
          </div>
          <Link
            href={`/admin/seguimiento/${row.user_id}?email=${encodeURIComponent(row.email)}`}
            className="shrink-0 font-medium text-rose-600 hover:underline"
          >
            📊 Ver
          </Link>
        </div>
      )}

      <p className="mt-3 text-[11px] text-rose-700/40">
        Últimos 7 días: {recent} de 7 · Solo se muestra el uso, no el contenido.
      </p>
    </li>
  );
}
