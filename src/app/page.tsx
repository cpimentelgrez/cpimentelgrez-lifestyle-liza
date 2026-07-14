import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { logout } from "./login/actions";

type Card = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
};

export default async function Inicio() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isCurrentUserAdmin();

  const cards: Card[] = [
    {
      href: "/registro",
      emoji: "📝",
      title: "Registro diario",
      desc: "Ánimo, energía, alimentación, medicación, ansiedad y tareas de hoy.",
    },
    {
      href: "/rutinas",
      emoji: "💪",
      title: "Súper adulta",
      desc: "Tus rutinas por día y el checklist de hoy: limpiar, cocinar, paseo de Lily…",
    },
    {
      href: "/evolucion",
      emoji: "📈",
      title: "Evolución",
      desc: "Cómo han ido tu ánimo, energía y ansiedad estos días, con tu racha.",
    },
  ];

  if (admin) {
    cards.push({
      href: "/admin",
      emoji: "🛡️",
      title: "Panel",
      desc: "Seguimiento del uso de las cuentas (sin ver el contenido privado).",
    });
  }

  return (
    <div className="min-h-full bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-rose-900">Lifestyle 🌸</h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Bienvenida */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-rose-100 sm:grid sm:grid-cols-2">
          <div className="relative h-72 w-full bg-rose-100 sm:h-full sm:min-h-[300px]">
            <Image
              src="/portada.jpg"
              alt="Portada"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 336px"
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center p-6">
            <h2 className="text-2xl font-semibold text-rose-900">
              ¡Hola de nuevo! 🌷
            </h2>
            <p className="mt-2 text-sm text-rose-700/70">
              ¿Qué quieres hacer hoy? Elige una sección para empezar.
            </p>
          </div>
        </section>

        {/* Accesos a las secciones */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100 transition hover:ring-rose-300"
            >
              <div className="text-3xl">{c.emoji}</div>
              <h3 className="mt-3 text-lg font-semibold text-rose-900">
                {c.title}
              </h3>
              <p className="mt-1 text-sm text-rose-700/70">{c.desc}</p>
              <span className="mt-3 inline-block text-sm font-medium text-rose-600 group-hover:underline">
                Entrar →
              </span>
            </Link>
          ))}
        </section>

        <p className="mt-8 text-center text-xs text-rose-700/50">
          Sesión iniciada como {user.email}
        </p>
      </main>
    </div>
  );
}
