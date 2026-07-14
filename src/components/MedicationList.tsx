"use client";

import { useState } from "react";

export type Medication = { name: string; dose: string; schedule: string };

const EMPTY: Medication = { name: "", dose: "", schedule: "" };

// Lista dinámica de medicamentos: cada uno con fármaco, dosis y horario.
export default function MedicationList({ initial }: { initial: Medication[] }) {
  const [meds, setMeds] = useState<Medication[]>(
    initial.length > 0 ? initial : [{ ...EMPTY }],
  );

  function update(index: number, field: keyof Medication, value: string) {
    setMeds((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  }

  function add() {
    setMeds((prev) => [...prev, { ...EMPTY }]);
  }

  function remove(index: number) {
    setMeds((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ ...EMPTY }];
    });
  }

  // Solo se guardan los que tengan algún dato.
  const serialized = JSON.stringify(
    meds.filter((m) => m.name.trim() || m.dose.trim() || m.schedule.trim()),
  );

  return (
    <div>
      <p className="text-sm font-medium text-rose-900">Mis medicamentos</p>
      <p className="text-xs text-rose-700/60">
        Añade el fármaco, la dosis y el horario. Puedes poner varios.
      </p>

      <div className="mt-3 space-y-3">
        {meds.map((med, i) => (
          <div
            key={i}
            className="rounded-lg border border-rose-200 bg-white p-3"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-rose-700/70">Fármaco</label>
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                  placeholder="Ej. Sertralina"
                  className="mt-1 w-full rounded-md border border-rose-200 px-2.5 py-1.5 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <div>
                <label className="block text-xs text-rose-700/70">Dosis</label>
                <input
                  type="text"
                  value={med.dose}
                  onChange={(e) => update(i, "dose", e.target.value)}
                  placeholder="Ej. 50 mg"
                  className="mt-1 w-full rounded-md border border-rose-200 px-2.5 py-1.5 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <div>
                <label className="block text-xs text-rose-700/70">Horario</label>
                <input
                  type="text"
                  value={med.schedule}
                  onChange={(e) => update(i, "schedule", e.target.value)}
                  placeholder="Ej. 8:00 y 20:00"
                  className="mt-1 w-full rounded-md border border-rose-200 px-2.5 py-1.5 text-sm text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                />
              </div>
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-rose-400 hover:text-rose-600 hover:underline"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 rounded-lg border border-dashed border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
      >
        + Añadir otro medicamento
      </button>

      <input type="hidden" name="medications" value={serialized} />
    </div>
  );
}
