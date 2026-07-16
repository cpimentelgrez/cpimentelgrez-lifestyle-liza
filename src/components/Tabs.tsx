"use client";

import { useState, type ReactNode } from "react";

export default function Tabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-rose-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              active === t.id
                ? "bg-rose-500 text-white shadow-sm"
                : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div key={t.id} className={active === t.id ? "space-y-8" : "hidden"}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
