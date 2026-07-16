"use client";

import { useTransition } from "react";
import { toggleCompletion } from "@/app/rutinas/actions";

// Botón-casilla para marcar/desmarcar una rutina como hecha hoy.
// `occasional` aplica un color distinto (ámbar) para diferenciarla de las rutinas fijas.
export default function CompletionToggle({
  routineId,
  logDate,
  done,
  label,
  occasional = false,
}: {
  routineId: string;
  logDate: string;
  done: boolean;
  label: string;
  occasional?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const idleBorder = occasional ? "border-amber-200" : "border-rose-200";
  const idleBg = occasional ? "bg-amber-50/50" : "bg-white";
  const idleHover = occasional ? "hover:border-amber-300" : "hover:border-rose-300";
  const idleCheckBorder = occasional ? "border-amber-300" : "border-rose-300";
  const idleText = occasional ? "text-amber-900" : "text-rose-900";

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
          : `${idleBorder} ${idleBg} ${idleHover}`
      } ${pending ? "opacity-50" : ""}`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
          done
            ? "border-green-500 bg-green-500 text-white"
            : `${idleCheckBorder} bg-white`
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={`text-sm ${done ? "text-green-800 line-through" : idleText}`}
      >
        {label}
      </span>
    </button>
  );
}
