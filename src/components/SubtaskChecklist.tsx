"use client";

import { useTransition } from "react";
import { toggleSubtask } from "@/app/rutinas/actions";

// Muestra una rutina con subtareas: cada subtarea se marca por separado.
// `occasional` aplica un color distinto (ámbar) para diferenciarla de las rutinas fijas.
export default function SubtaskChecklist({
  routineId,
  logDate,
  name,
  subtasks,
  done,
  occasional = false,
}: {
  routineId: string;
  logDate: string;
  name: string;
  subtasks: string[];
  done: string[];
  occasional?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const doneSet = new Set(done);
  const allDone = subtasks.length > 0 && subtasks.every((s) => doneSet.has(s));

  const idleBorder = occasional ? "border-amber-200" : "border-rose-200";
  const idleBg = occasional ? "bg-amber-50/50" : "bg-white";
  const idleText = occasional ? "text-amber-900" : "text-rose-900";
  const chipIdle = occasional
    ? "border-amber-200 bg-white text-amber-800 hover:border-amber-400"
    : "border-rose-200 bg-white text-rose-700 hover:border-rose-400";

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 transition-all duration-300 ${
        allDone
          ? "border-green-200 bg-green-50 opacity-60 brightness-95"
          : `${idleBorder} ${idleBg}`
      } ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-medium ${allDone ? "text-green-800" : idleText}`}
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
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all duration-300 ${
                isDone
                  ? "border-green-400 bg-green-400 text-white opacity-70"
                  : chipIdle
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
