import Link from "next/link";

type Item = { href: string; emoji: string; label: string };

const BASE_ITEMS: Item[] = [
  { href: "/", emoji: "🏠", label: "Inicio" },
  { href: "/registro", emoji: "📝", label: "Registro" },
  { href: "/rutinas", emoji: "💪", label: "Rutinas" },
  { href: "/evolucion", emoji: "📈", label: "Evolución" },
];

// Barra de navegación inferior, fija e igual en todas las páginas.
export default function BottomNav({
  active,
  admin = false,
}: {
  active: "inicio" | "registro" | "rutinas" | "evolucion" | "admin";
  admin?: boolean;
}) {
  const items = admin
    ? [...BASE_ITEMS, { href: "/admin", emoji: "🛡️", label: "Panel" }]
    : BASE_ITEMS;

  const activeHref: Record<typeof active, string> = {
    inicio: "/",
    registro: "/registro",
    rutinas: "/rutinas",
    evolucion: "/evolucion",
    admin: "/admin",
  };

  return (
    <nav className="sticky bottom-0 z-10 border-t border-rose-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 py-1.5">
        {items.map((item) => {
          const isActive = item.href === activeHref[active];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-center transition ${
                isActive ? "text-rose-600" : "text-rose-400 hover:text-rose-500"
              }`}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span className={`text-[11px] ${isActive ? "font-medium" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
