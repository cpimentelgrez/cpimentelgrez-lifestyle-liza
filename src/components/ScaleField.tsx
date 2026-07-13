"use client";

import { useState } from "react";

type Props = {
  name: string;
  label: string;
  hint?: string;
  min?: number;
  max?: number;
  defaultValue?: number | null;
  lowLabel?: string;
  highLabel?: string;
};

// Campo de escala tipo 1-5 con botones (radio buttons estilizados).
export default function ScaleField({
  name,
  label,
  hint,
  min = 1,
  max = 5,
  defaultValue = null,
  lowLabel,
  highLabel,
}: Props) {
  const [value, setValue] = useState<number | null>(defaultValue);
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-rose-900">{label}</label>
        {hint && <span className="text-xs text-rose-700/60">{hint}</span>}
      </div>

      <div className="mt-2 flex gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setValue(active ? null : opt)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                active
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-rose-200 bg-white text-rose-700 hover:border-rose-400"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {(lowLabel || highLabel) && (
        <div className="mt-1 flex justify-between text-xs text-rose-700/50">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}

      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  );
}
