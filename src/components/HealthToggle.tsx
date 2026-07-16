"use client";

import { useTransition } from "react";
import { setHealthState } from "@/app/periodos/actions";
import { HEALTH_LABELS, type HealthState } from "@/lib/periods";

// Selector rápido de "cómo te sientes hoy" (sin fechas, solo para hoy).
export default function HealthToggle({
  today,
  current,
}: {
  today: string;
  current: HealthState | null;
}) {
  const [pending, startTransition] = useTransition();

  const options: { value: HealthState | null; label: string }[] = [
    { value: null, label: "🙂 Normal" },
    ...(Object.keys(HEALTH_LABELS) as HealthState[]).map((s) => ({
      value: s,
      label: HEALTH_LABELS[s],
    })),
  ];

  return (
    <div className={pending ? "opacity-60" : ""}>
      <p className="text-xs font-medium text-rose-700/70">¿Cómo te sientes hoy?</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.value === current;
          return (
            <button
              key={o.label}
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => setHealthState(today, o.value))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-rose-200 bg-white text-rose-700 hover:border-rose-400"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
