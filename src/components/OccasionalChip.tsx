"use client";

import { useTransition } from "react";
import { toggleCompletion } from "@/app/rutinas/actions";

// Chip compacto para marcar una tarea ocasional al instante.
export default function OccasionalChip({
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
        done
          ? "border-amber-700 bg-amber-700 text-amber-50 opacity-80"
          : "border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400"
      } ${pending ? "opacity-50" : ""}`}
    >
      <span>{done ? "✓" : "○"}</span>
      {label}
    </button>
  );
}
