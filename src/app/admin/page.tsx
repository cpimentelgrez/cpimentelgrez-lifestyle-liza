import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin, type UsageRow } from "@/lib/admin";
import { logout } from "../login/actions";
import UsageCard from "@/components/UsageCard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Solo administradoras.
  const admin = await isCurrentUserAdmin();
  if (!admin) {
    redirect("/");
  }

  const { data, error } = await supabase.rpc("admin_usage_overview");
  const rows = (data as UsageRow[]) ?? [];

  const activas = rows.filter((r) => r.days_last_7 > 0).length;
  const totalCuentas = rows.length;

  return (
    <div className="min-h-full bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-rose-900">Panel de administración 🛡️</h1>
            <p className="text-xs text-rose-700/60">Seguimiento de uso · {user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              🏠 Inicio
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-rose-100">
          <p className="text-sm text-rose-700/70">
            Aquí ves <span className="font-medium text-rose-900">si</span> cada cuenta está
            usando las distintas áreas de la plataforma. Por privacidad,{" "}
            <span className="font-medium text-rose-900">no se muestra el contenido</span> de
            lo que registran (ni notas ni valores).
          </p>
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-2xl font-semibold text-rose-900">{totalCuentas}</p>
              <p className="text-xs text-rose-700/60">Cuentas</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-rose-900">{activas}</p>
              <p className="text-xs text-rose-700/60">Activas (últimos 7 días)</p>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            No se pudo cargar el resumen: {error.message}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-rose-700/60 ring-1 ring-rose-100">
            Todavía no hay cuentas registradas (aparte de la tuya). Cuando tu amiga se
            registre, aparecerá aquí. 🌱
          </p>
        ) : (
          <ul className="space-y-4">
            {rows.map((row) => (
              <UsageCard key={row.user_id} row={row} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
