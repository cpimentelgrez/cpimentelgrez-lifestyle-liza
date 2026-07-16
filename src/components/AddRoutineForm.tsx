"use client";

import { useState } from "react";
import { addRoutine } from "@/app/rutinas/actions";
import { WEEKDAY_SHORT } from "@/lib/rutinas";

const SUGGESTIONS = [
  "Gimnasio",
  "Limpiar",
  "Cocinar",
  "Paseo de Lily",
  "Lavar ropa",
  "Supermercado",
  "Pagar cuentas",
];

type ScheduleKind = "none" | "date" | "monthly";

// Formulario para añadir una rutina (fija con días, u ocasional).
export default function AddRoutineForm() {
  const [occasional, setOccasional] = useState(false);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [name, setName] = useState("");
  const [scheduleKind, setScheduleKind] = useState<ScheduleKind>("none");

  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  }

  return (
    <form action={addRoutine} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-rose-900">
          Nueva tarea
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Limpiar, Paseo de Lily, Supermercado…"
          className="mt-1 w-full rounded-lg border border-rose-200 px-3 py-2 text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setName(s)}
              className="rounded-full border border-rose-200 px-2.5 py-0.5 text-xs text-rose-600 transition hover:bg-rose-100"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="time_of_day"
            className="block text-xs font-medium text-rose-700/70"
          >
            Rango del día
          </label>
          <select
            id="time_of_day"
            name="time_of_day"
            className="mt-1 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          >
            <option value="manana">🌅 Mañana</option>
            <option value="tarde">☀️ Tarde</option>
            <option value="noche">🌙 Noche</option>
          </select>
        </div>

        {!occasional && (
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-medium text-rose-700/70"
            >
              Tipo
            </label>
            <select
              id="category"
              name="category"
              className="mt-1 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            >
              <option value="hogar">🏠 Rutina hogar</option>
              <option value="autocuidado">🧘 Autocuidado</option>
            </select>
          </div>
        )}

        <label className="flex items-center gap-2 pb-2 text-sm text-rose-900">
          <input
            type="checkbox"
            name="is_occasional"
            checked={occasional}
            onChange={(e) => setOccasional(e.target.checked)}
            className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
          />
          Es ocasional (sin días fijos)
        </label>
      </div>

      {!occasional ? (
        <div>
          <p className="text-xs font-medium text-rose-700/70">¿Qué días?</p>
          <div className="mt-2 flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const active = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    active
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-rose-200 bg-white text-rose-700 hover:border-rose-400"
                  }`}
                >
                  {WEEKDAY_SHORT[d]}
                </button>
              );
            })}
          </div>
          {/* Los días seleccionados se envían como varios inputs weekdays. */}
          {days.map((d) => (
            <input key={d} type="hidden" name="weekdays" value={d} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-amber-50/60 p-3">
          <p className="text-xs font-medium text-amber-800">¿Cuándo toca?</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-amber-900">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="schedule_kind"
                value="none"
                checked={scheduleKind === "none"}
                onChange={() => setScheduleKind("none")}
                className="text-amber-600 focus:ring-amber-400"
              />
              Sin fecha fija
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="schedule_kind"
                value="date"
                checked={scheduleKind === "date"}
                onChange={() => setScheduleKind("date")}
                className="text-amber-600 focus:ring-amber-400"
              />
              Fecha específica
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="schedule_kind"
                value="monthly"
                checked={scheduleKind === "monthly"}
                onChange={() => setScheduleKind("monthly")}
                className="text-amber-600 focus:ring-amber-400"
              />
              Cada mes
            </label>
          </div>

          {scheduleKind === "date" && (
            <input
              type="date"
              name="scheduled_date"
              required
              className="mt-2 rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 outline-none focus:border-amber-400"
            />
          )}
          {scheduleKind === "monthly" && (
            <div className="mt-2 flex items-center gap-2 text-sm text-amber-900">
              <span>El día</span>
              <input
                type="number"
                name="monthly_day"
                min={1}
                max={31}
                required
                placeholder="5"
                className="w-16 rounded-lg border border-amber-200 px-2 py-2 text-center outline-none focus:border-amber-400"
              />
              <span>de cada mes</span>
            </div>
          )}
          {scheduleKind === "none" && (
            <p className="mt-2 text-xs text-amber-700/70">
              Aparecerá como chip para marcar cuando la necesites (ej. supermercado).
            </p>
          )}
          {scheduleKind !== "none" && (
            <p className="mt-2 text-xs text-amber-700/70">
              Se avisa un día antes y ese día se suma a las tareas pendientes. 🔔
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
      >
        Añadir tarea
      </button>
    </form>
  );
}
