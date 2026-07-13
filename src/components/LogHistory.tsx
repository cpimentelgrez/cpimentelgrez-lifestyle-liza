import { deleteDailyLog } from "@/app/logs/actions";
import type { DailyLog } from "./DailyLogForm";

function Chip({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs text-rose-800">
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function LogHistory({ logs }: { logs: DailyLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl bg-white p-6 text-center text-sm text-rose-700/60 ring-1 ring-rose-100">
        Aún no hay registros anteriores. ¡El de hoy será el primero! 🌱
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li
          key={log.id}
          className="rounded-xl bg-white p-4 ring-1 ring-rose-100"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium capitalize text-rose-900">
              {formatDate(log.log_date)}
            </p>
            <form action={deleteDailyLog}>
              <input type="hidden" name="id" value={log.id} />
              <button
                type="submit"
                className="text-xs text-rose-400 hover:text-rose-600 hover:underline"
              >
                Borrar
              </button>
            </form>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip label="⚡" value={log.energy} />
            <Chip label="😊" value={log.mood} />
            <Chip label="😰" value={log.anxiety} />
            <Chip label="🍽️" value={log.food_rating} />
            <Chip label="💊" value={log.medication_taken ? "Sí" : "No"} />
            <Chip
              label="✅"
              value={log.tasks_completion !== null ? `${log.tasks_completion}%` : null}
            />
          </div>

          {log.notes && (
            <p className="mt-2 text-sm text-rose-700/80">{log.notes}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
