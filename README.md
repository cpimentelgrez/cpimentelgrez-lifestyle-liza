# Lifestyle · Registro diario 🌸

Plataforma de estilo de vida. **Módulo 1: Registro diario** — permite a cada usuaria
registrar cada día su alimentación, energía, ánimo, medicación, ansiedad y cumplimiento
de tareas. Cada persona tiene su cuenta y solo ve sus propios datos.

Construido con **Next.js 16 + TypeScript + Tailwind CSS** y **Supabase** (autenticación +
base de datos en la nube).

---

## 🚀 Puesta en marcha (paso a paso)

### 1. Crea un proyecto en Supabase (gratis)

1. Entra en <https://supabase.com> y crea una cuenta.
2. Pulsa **New project**. Ponle un nombre (ej. `lifestyle-liza`) y elige una contraseña
   para la base de datos (guárdala).
3. Espera 1-2 minutos a que el proyecto se cree.

### 2. Crea las tablas

1. En el panel de Supabase, ve a **SQL Editor** (icono de terminal en la barra izquierda).
2. Pulsa **New query**.
3. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este proyecto, copia
   **todo** su contenido y pégalo en el editor.
4. Pulsa **Run**. Debería decir *Success*.

### 3. Copia tus claves de API

1. En Supabase, ve a **Project Settings** (rueda dentada) → **API**.
2. Copia estos dos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Abre el archivo `.env.local` de este proyecto y pégalos:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

> ℹ️ La clave `anon` es pública y segura para usar en el navegador: la seguridad real la
> da el **Row Level Security** que activa el script SQL (cada usuaria solo accede a lo suyo).

### 4. (Opcional) Desactiva la confirmación por email para probar más rápido

Mientras pruebas con tu amiga, en **Authentication → Providers → Email** puedes desactivar
*"Confirm email"* para que las cuentas nuevas entren directamente sin verificar el correo.
Cuando lo pongas en producción, vuelve a activarlo.

### 5. Arranca la app

```bash
npm run dev
```

Abre <http://localhost:3000>. Te llevará a la pantalla de inicio de sesión.
Crea una cuenta en **"Crea una"** y empieza a registrar tu día.

---

## 📋 Qué se registra cada día

- 🍽️ **Alimentación** — valoración 1-5 + notas
- ⚡ **Energía** — escala 1-5
- 😊 **Ánimo** — escala 1-5
- 😰 **Ansiedad** — escala 1-5
- 💊 **Medicación** — si la tomó + notas
- ✅ **Cumplimiento de tareas** — porcentaje 0-100 % + notas
- 📝 **Notas** libres del día

Hay **un registro por día** por usuaria (si guardas otra vez el mismo día, se actualiza).

---

## 🧱 Estructura del proyecto

```
src/
  app/
    page.tsx            → Dashboard: formulario de hoy + historial
    login/              → Inicio de sesión + Server Actions de auth
    signup/             → Registro de cuenta
    logs/actions.ts     → Guardar / borrar registros diarios
  components/
    DailyLogForm.tsx    → Formulario del registro diario
    LogHistory.tsx      → Lista del historial
    ScaleField.tsx      → Selector de escala 1-5
  lib/supabase/         → Clientes de Supabase (browser, server, middleware)
  middleware.ts         → Protege las rutas privadas
supabase/
  schema.sql            → Tablas + seguridad (ejecutar en Supabase)
```

## 🌱 Próximos módulos (ideas)

Este es el primer apartado. La estructura está lista para añadir más secciones de la
plataforma lifestyle (gráficas de evolución, recordatorios, hábitos, etc.).
