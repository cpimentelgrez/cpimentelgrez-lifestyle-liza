"use client";

import { useTransition } from "react";
import { toggleSubtask } from "@/app/rutinas/actions";

// Muestra una rutina con subtareas: cada subtarea se marca por separado.
export default function SubtaskChecklist({
  routineId,
  logDate,
  name,
  subtasks,
  done,
}: {
  routineId: string;
  logDate: string;
  name: string;
  subtasks: string[];
  done: string[];
}) {
  const [pending, startTransition] = useTransition();
  const doneSet = new Set(done);
  const allDone = subtasks.length > 0 && subtasks.every((s) => doneSet.has(s));

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        allDone ? "border-green-200 bg-green-50" : "border-rose-200 bg-white"
      } ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-medium ${allDone ? "text-green-800" : "text-rose-900"}`}
        >
          {name}
        </span>
        <span className="text-xs text-rose-700/60">
          {subtasks.filter((s) => doneSet.has(s)).length}/{subtasks.length}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {subtasks.map((s) => {
          const isDone = doneSet.has(s);
          return (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(() => toggleSubtask(routineId, logDate, s))
              }
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                isDone
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-rose-200 bg-white text-rose-700 hover:border-rose-400"
              }`}
            >
              <span>{isDone ? "✓" : "○"}</span>
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
