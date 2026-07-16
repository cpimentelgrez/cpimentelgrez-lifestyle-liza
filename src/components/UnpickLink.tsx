"use client";

import { useTransition } from "react";
import { unpickOccasional } from "@/app/rutinas/actions";

// Enlace para sacar del día un ocasional que se jaló por error.
export default function UnpickLink({
  routineId,
  logDate,
}: {
  routineId: string;
  logDate: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => unpickOccasional(routineId, logDate))}
      className="mt-1 text-[11px] text-amber-600 hover:text-amber-800 hover:underline"
    >
      Quitar de hoy
    </button>
  );
}
