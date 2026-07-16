"use client";

import { useTransition } from "react";
import { pickOccasional } from "@/app/rutinas/actions";

// Chip para "jalar" un ocasional sin fecha al día de hoy: pasa a contar
// como pendiente normal en el checklist, en vez de marcarse aquí mismo.
export default function OccasionalChip({
  routineId,
  logDate,
  label,
}: {
  routineId: string;
  logDate: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => pickOccasional(routineId, logDate))}
      className={`inline-flex items-center gap-1.5 rounded-full border border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:border-amber-400 hover:bg-amber-100 ${
        pending ? "opacity-50" : ""
      }`}
    >
      <span>+</span> {label}
    </button>
  );
}
