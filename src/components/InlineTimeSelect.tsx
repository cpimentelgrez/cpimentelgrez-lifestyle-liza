"use client";

import { useTransition } from "react";
import { setRoutineTime } from "@/app/rutinas/actions";
import type { TimeOfDay } from "@/lib/rutinas";

const OPTIONS: { value: TimeOfDay; emoji: string; label: string }[] = [
  { value: "manana", emoji: "🌅", label: "Mañana" },
  { value: "tarde", emoji: "☀️", label: "Tarde" },
  { value: "noche", emoji: "🌙", label: "Noche" },
];

// Botones para mover una tarea a otro rango horario, directo desde "Hoy".
export default function InlineTimeSelect({
  routineId,
  current,
}: {
  routineId: string;
  current: TimeOfDay;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`flex shrink-0 gap-1 ${pending ? "opacity-50" : ""}`}>
      {OPTIONS.map((o) => {
        const active = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            disabled={pending || active}
            onClick={() => startTransition(() => setRoutineTime(routineId, o.value))}
            aria-label={`Mover a ${o.label}`}
            title={`Mover a ${o.label}`}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-sm transition ${
              active
                ? "bg-rose-500"
                : "bg-rose-50 opacity-50 hover:opacity-100 hover:bg-rose-100"
            }`}
          >
            {o.emoji}
          </button>
        );
      })}
    </div>
  );
}
