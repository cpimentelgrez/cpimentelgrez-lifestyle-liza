"use client";

import { useState, useTransition } from "react";
import {
  toggleRoutineDay,
  setRoutineTime,
  setRoutineCategory,
  setOccasionalSchedule,
  renameRoutine,
  addSubtask,
  removeSubtask,
  deleteRoutine,
} from "@/app/rutinas/actions";
import {
  type Routine,
  type TimeOfDay,
  type Category,
  CLEANING_SUBTASKS,
  WEEKDAY_SHORT,
} from "@/lib/rutinas";

type ScheduleKind = "none" | "date" | "monthly";

function initialScheduleKind(routine: Routine): ScheduleKind {
  if (routine.scheduled_date) return "date";
  if (routine.monthly_day) return "monthly";
  return "none";
}

export default function RoutineEditor({ routine }: { routine: Routine }) {
  const [pending, startTransition] = useTransition();
  const [newSub, setNewSub] = useState("");
  const [name, setName] = useState(routine.name);
  const [scheduleKind, setScheduleKind] = useState<ScheduleKind>(
    initialScheduleKind(routine),
  );
  const [scheduledDate, setScheduledDate] = useState(routine.scheduled_date ?? "");
  const [monthlyDay, setMonthlyDay] = useState(
    routine.monthly_day ? String(routine.monthly_day) : "",
  );

  // Las sugerencias de limpieza solo aparecen en tareas de limpieza.
  // Se usa \baseo\b para no confundir "paseo" con "aseo".
  const isCleaning = /limpi|\baseo\b/i.test(routine.name);
  const suggestions = isCleaning
    ? CLEANING_SUBTASKS.filter((s) => !routine.subtasks.includes(s))
    : [];

  return (
    <div
      className={`rounded-xl border border-rose-100 p-3 ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            const v = name.trim();
            if (v && v !== routine.name) {
              startTransition(() => renameRoutine(routine.id, v));
            } else if (!v) {
              setName(routine.name);
            }
          }}
          aria-label="Nombre de la tarea"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-rose-900 outline-none hover:border-rose-200 focus:border-rose-400 focus:bg-white"
        />
        <form action={deleteRoutine}>
          <input type="hidden" name="id" value={routine.id} />
          <button
            type="submit"
            className="text-xs text-rose-400 hover:text-rose-600 hover:underline"
          >
            Quitar
          </button>
        </form>
      </div>

      {/* Rango horario */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-rose-700/60">Rango:</span>
        <select
          value={routine.time_of_day}
          onChange={(e) =>
            startTransition(() =>
              setRoutineTime(routine.id, e.target.value as TimeOfDay),
            )
          }
          className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-900 outline-none focus:border-rose-400"
        >
          <option value="manana">🌅 Mañana</option>
          <option value="tarde">☀️ Tarde</option>
          <option value="noche">🌙 Noche</option>
        </select>
      </div>

      {/* Categoría (solo rutinas fijas) */}
      {!routine.is_occasional && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-rose-700/60">Tipo:</span>
          <select
            value={routine.category}
            onChange={(e) =>
              startTransition(() =>
                setRoutineCategory(routine.id, e.target.value as Category),
              )
            }
            className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-900 outline-none focus:border-rose-400"
          >
            <option value="hogar">🏠 Rutina hogar</option>
            <option value="autocuidado">🧘 Autocuidado</option>
          </select>
        </div>
      )}

      {/* Días (solo rutinas fijas) */}
      {!routine.is_occasional ? (
        <div className="mt-2">
          <span className="text-xs text-rose-700/60">Días:</span>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const active = routine.weekdays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() =>
                    startTransition(() => toggleRoutineDay(routine.id, d))
                  }
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition ${
                    active
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-rose-200 bg-white text-rose-600 hover:border-rose-400"
                  }`}
                >
                  {WEEKDAY_SHORT[d]}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-2 rounded-lg bg-amber-50/60 p-2.5">
          <span className="text-xs text-amber-700/70">¿Cuándo toca?</span>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-amber-900">
            {(["none", "date", "monthly"] as ScheduleKind[]).map((k) => (
              <label key={k} className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={scheduleKind === k}
                  onChange={() => {
                    setScheduleKind(k);
                    startTransition(() =>
                      setOccasionalSchedule(
                        routine.id,
                        k,
                        k === "date" ? scheduledDate : k === "monthly" ? monthlyDay : "",
                      ),
                    );
                  }}
                  className="text-amber-600 focus:ring-amber-400"
                />
                {k === "none" ? "Sin fecha" : k === "date" ? "Fecha" : "Cada mes"}
              </label>
            ))}
          </div>

          {scheduleKind === "date" && (
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => {
                setScheduledDate(e.target.value);
                startTransition(() =>
                  setOccasionalSchedule(routine.id, "date", e.target.value),
                );
              }}
              className="mt-1.5 rounded-md border border-amber-200 px-2 py-1 text-xs text-amber-900 outline-none focus:border-amber-400"
            />
          )}
          {scheduleKind === "monthly" && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-900">
              <span>Día</span>
              <input
                type="number"
                min={1}
                max={31}
                value={monthlyDay}
                onChange={(e) => {
                  setMonthlyDay(e.target.value);
                  startTransition(() =>
                    setOccasionalSchedule(routine.id, "monthly", e.target.value),
                  );
                }}
                className="w-14 rounded-md border border-amber-200 px-1.5 py-1 text-center outline-none focus:border-amber-400"
              />
              <span>de cada mes</span>
            </div>
          )}
        </div>
      )}

      {/* Subtareas */}
      <div className="mt-3">
        <span className="text-xs text-rose-700/60">Subtareas:</span>
        {routine.subtasks.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {routine.subtasks.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800"
              >
                {s}
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => removeSubtask(routine.id, s))
                  }
                  className="text-rose-500 hover:text-rose-700"
                  aria-label={`Quitar ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            placeholder="Añadir subtarea…"
            className="w-40 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-900 outline-none focus:border-rose-400"
          />
          <button
            type="button"
            onClick={() => {
              const v = newSub.trim();
              if (v) {
                startTransition(() => addSubtask(routine.id, v));
                setNewSub("");
              }
            }}
            className="rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            Añadir
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => startTransition(() => addSubtask(routine.id, s))}
                className="rounded-full border border-rose-200 px-2 py-0.5 text-[11px] text-rose-500 hover:bg-rose-100"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
