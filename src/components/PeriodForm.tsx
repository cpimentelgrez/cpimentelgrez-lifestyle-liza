"use client";

import { useState } from "react";
import { createPeriod } from "@/app/periodos/actions";

type PeriodType = "vacaciones" | "viaje" | "otro";

// Formulario para agendar un periodo (vacaciones, viaje, u otro con nombre libre).
export default function PeriodForm() {
  const [type, setType] = useState<PeriodType>("vacaciones");

  return (
    <form action={createPeriod} className="space-y-3">
      <div className="flex flex-wrap gap-3 text-sm text-rose-900">
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="type"
            value="vacaciones"
            checked={type === "vacaciones"}
            onChange={() => setType("vacaciones")}
            className="text-rose-500 focus:ring-rose-400"
          />
          🏖️ Vacaciones
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="type"
            value="viaje"
            checked={type === "viaje"}
            onChange={() => setType("viaje")}
            className="text-rose-500 focus:ring-rose-400"
          />
          💼 Viaje de trabajo
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="type"
            value="otro"
            checked={type === "otro"}
            onChange={() => setType("otro")}
            className="text-rose-500 focus:ring-rose-400"
          />
          📌 Otro
        </label>
      </div>

      {type === "otro" && (
        <div>
          <label htmlFor="note" className="block text-xs font-medium text-rose-700/70">
            ¿Qué es?
          </label>
          <input
            id="note"
            name="note"
            type="text"
            required
            placeholder="Ej. Exámenes, mudanza, visita familiar…"
            className="mt-1 w-full rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400"
          />
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="start_date" className="block text-xs font-medium text-rose-700/70">
            Desde
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            className="mt-1 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400"
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-xs font-medium text-rose-700/70">
            Hasta
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            required
            className="mt-1 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-900 outline-none focus:border-rose-400"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
        >
          Agendar
        </button>
      </div>

      {type === "otro" ? (
        <p className="text-xs text-rose-700/50">
          Solo se muestra como aviso. No pausa rutinas ni agenda maletas.
        </p>
      ) : (
        <p className="text-xs text-rose-700/50">
          Se agregan solas las tareas de maletas (antes de salir y al volver), y las
          rutinas de hogar se pausan mientras dure.
        </p>
      )}
    </form>
  );
}
