import { saveDailyLog } from "@/app/logs/actions";
import ScaleField from "./ScaleField";

export type DailyLog = {
  id: string;
  log_date: string;
  food_notes: string | null;
  food_rating: number | null;
  energy: number | null;
  mood: number | null;
  anxiety: number | null;
  medication_taken: boolean | null;
  medication_notes: string | null;
  tasks_completion: number | null;
  tasks_notes: string | null;
  notes: string | null;
};

export default function DailyLogForm({
  today,
  existing,
}: {
  today: string;
  existing: DailyLog | null;
}) {
  return (
    <form action={saveDailyLog} className="space-y-6">
      <div>
        <label htmlFor="log_date" className="block text-sm font-medium text-rose-900">
          Fecha
        </label>
        <input
          id="log_date"
          name="log_date"
          type="date"
          defaultValue={existing?.log_date ?? today}
          className="mt-1 rounded-lg border border-rose-200 px-3 py-2 text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {/* Alimentación */}
      <section className="rounded-xl bg-rose-50/60 p-4">
        <h3 className="text-sm font-semibold text-rose-900">🍽️ Alimentación</h3>
        <div className="mt-3 space-y-3">
          <ScaleField
            name="food_rating"
            label="¿Cómo comiste hoy?"
            defaultValue={existing?.food_rating ?? null}
            lowLabel="Mal"
            highLabel="Muy bien"
          />
          <textarea
            name="food_notes"
            rows={2}
            placeholder="¿Qué comiste? ¿Cómo te sentaron las comidas?"
            defaultValue={existing?.food_notes ?? ""}
            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
        </div>
      </section>

      {/* Energía, ánimo, ansiedad */}
      <section className="grid gap-4 rounded-xl bg-rose-50/60 p-4 sm:grid-cols-3">
        <ScaleField
          name="energy"
          label="⚡ Energía"
          defaultValue={existing?.energy ?? null}
          lowLabel="Baja"
          highLabel="Alta"
        />
        <ScaleField
          name="mood"
          label="😊 Ánimo"
          defaultValue={existing?.mood ?? null}
          lowLabel="Mal"
          highLabel="Bien"
        />
        <ScaleField
          name="anxiety"
          label="😰 Ansiedad"
          defaultValue={existing?.anxiety ?? null}
          lowLabel="Nada"
          highLabel="Mucha"
        />
      </section>

      {/* Medicación */}
      <section className="rounded-xl bg-rose-50/60 p-4">
        <h3 className="text-sm font-semibold text-rose-900">💊 Medicación</h3>
        <label className="mt-3 flex items-center gap-2 text-sm text-rose-900">
          <input
            type="checkbox"
            name="medication_taken"
            defaultChecked={existing?.medication_taken ?? false}
            className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
          />
          Tomé mi medicación hoy
        </label>
        <textarea
          name="medication_notes"
          rows={2}
          placeholder="Notas sobre la medicación (dosis, horarios, efectos...)"
          defaultValue={existing?.medication_notes ?? ""}
          className="mt-3 w-full rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
        />
      </section>

      {/* Tareas */}
      <section className="rounded-xl bg-rose-50/60 p-4">
        <h3 className="text-sm font-semibold text-rose-900">✅ Cumplimiento de tareas</h3>
        <div className="mt-3">
          <label
            htmlFor="tasks_completion"
            className="block text-sm font-medium text-rose-900"
          >
            ¿Qué porcentaje de tus tareas completaste? (0-100 %)
          </label>
          <input
            id="tasks_completion"
            name="tasks_completion"
            type="number"
            min={0}
            max={100}
            defaultValue={existing?.tasks_completion ?? ""}
            placeholder="0"
            className="mt-1 w-28 rounded-lg border border-rose-200 px-3 py-2 text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <textarea
          name="tasks_notes"
          rows={2}
          placeholder="¿Qué tareas hiciste o quedaron pendientes?"
          defaultValue={existing?.tasks_notes ?? ""}
          className="mt-3 w-full rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
        />
      </section>

      {/* Notas generales */}
      <section>
        <label htmlFor="notes" className="block text-sm font-medium text-rose-900">
          📝 Notas del día
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Cualquier cosa que quieras recordar de hoy..."
          defaultValue={existing?.notes ?? ""}
          className="mt-1 w-full rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
        />
      </section>

      <button
        type="submit"
        className="w-full rounded-lg bg-rose-500 px-4 py-3 font-medium text-white transition hover:bg-rose-600"
      >
        {existing ? "Actualizar registro de hoy" : "Guardar registro"}
      </button>
    </form>
  );
}
