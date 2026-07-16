"use client";

import { useTransition } from "react";
import { toggleCompletion } from "@/app/rutinas/actions";

// Botón-casilla para marcar/desmarcar una rutina como hecha hoy.
export default function CompletionToggle({
  routineId,
  logDate,
  done,
  label,
}: {
  routineId: string;
  logDate: string;
  done: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => toggleCompletion(routineId, logDate, !done))
      }
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-300 ${
        done
          ? "border-green-200 bg-green-50 opacity-60 brightness-95"
          : "border-rose-200 bg-white hover:border-rose-300"
      } ${pending ? "opacity-50" : ""}`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
          done
            ? "border-green-500 bg-green-500 text-white"
            : "border-rose-300 bg-white"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={`text-sm ${done ? "text-green-800 line-through" : "text-rose-900"}`}
      >
        {label}
      </span>
    </button>
  );
}
