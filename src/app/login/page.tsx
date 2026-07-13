import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-rose-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-rose-100">
        <h1 className="text-2xl font-semibold text-rose-900">Hola de nuevo 🌸</h1>
        <p className="mt-1 text-sm text-rose-700/70">
          Inicia sesión para ver tu registro diario.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={login} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-rose-900"
            >
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-rose-200 px-3 py-2 text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-rose-900"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-rose-200 px-3 py-2 text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-rose-500 px-4 py-2 font-medium text-white transition hover:bg-rose-600"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-rose-700/70">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="font-medium text-rose-600 hover:underline">
            Crea una
          </Link>
        </p>
      </div>
    </main>
  );
}
