// Utilidades compartidas para el módulo de rutinas.

export type TimeOfDay = "manana" | "tarde" | "noche";
export type Category = "hogar" | "autocuidado";

export type Routine = {
  id: string;
  name: string;
  time_of_day: TimeOfDay;
  weekdays: number[]; // 1 = Lunes ... 7 = Domingo
  is_occasional: boolean;
  sort: number;
  subtasks: string[];
  category: Category;
  scheduled_date: string | null; // "YYYY-MM-DD", fecha única (solo ocasionales)
  monthly_day: number | null; // 1-31, se repite cada mes (solo ocasionales)
};

export const CATEGORY_LABELS: Record<Category, string> = {
  hogar: "🏠 Rutina hogar",
  autocuidado: "🧘 Autocuidado",
};

export const CATEGORY_ORDER: Category[] = ["hogar", "autocuidado"];

// Subtareas sugeridas para tareas de limpieza.
export const CLEANING_SUBTASKS = [
  "Cocina",
  "Baño",
  "Dormitorio",
  "Living",
  "Aspirar",
  "Trapear",
  "Ordenar",
  "Ventanas",
  "Basura",
];

export const TIME_LABELS: Record<TimeOfDay, string> = {
  manana: "🌅 Mañana",
  tarde: "☀️ Tarde",
  noche: "🌙 Noche",
};

export const TIME_ORDER: TimeOfDay[] = ["manana", "tarde", "noche"];

// Etiquetas cortas de los días (índice 1..7).
export const WEEKDAY_SHORT: Record<number, string> = {
  1: "L",
  2: "M",
  3: "X",
  4: "J",
  5: "V",
  6: "S",
  7: "D",
};

export const WEEKDAY_LONG: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

// Tareas que se crean automáticamente la primera vez que se entra al módulo.
// La usuaria puede editar días, reordenar o borrar después.
export const DEFAULT_ROUTINES: {
  name: string;
  time_of_day: TimeOfDay;
  weekdays: number[];
  is_occasional: boolean;
  subtasks: string[];
  category: Category;
  scheduled_date: null;
  monthly_day: number | null;
}[] = [
  { name: "Paseo de Lily", time_of_day: "manana", weekdays: [1, 2, 3, 4, 5, 6, 7], is_occasional: false, subtasks: [], category: "hogar", scheduled_date: null, monthly_day: null },
  { name: "Cocinar", time_of_day: "tarde", weekdays: [1, 2, 3, 4, 5, 6, 7], is_occasional: false, subtasks: [], category: "hogar", scheduled_date: null, monthly_day: null },
  { name: "Limpiar", time_of_day: "manana", weekdays: [1, 3, 5], is_occasional: false, subtasks: ["Cocina", "Baño", "Dormitorio", "Aspirar"], category: "hogar", scheduled_date: null, monthly_day: null },
  { name: "Gimnasio", time_of_day: "manana", weekdays: [1, 3, 5], is_occasional: false, subtasks: [], category: "autocuidado", scheduled_date: null, monthly_day: null },
  { name: "Lavar ropa", time_of_day: "manana", weekdays: [6], is_occasional: false, subtasks: [], category: "hogar", scheduled_date: null, monthly_day: null },
  { name: "Preparar maletas", time_of_day: "manana", weekdays: [], is_occasional: true, subtasks: [], category: "hogar", scheduled_date: null, monthly_day: null },
  { name: "Guardar maletas", time_of_day: "manana", weekdays: [], is_occasional: true, subtasks: [], category: "hogar", scheduled_date: null, monthly_day: null },
  { name: "Comprar pasajes", time_of_day: "tarde", weekdays: [], is_occasional: true, subtasks: [], category: "hogar", scheduled_date: null, monthly_day: null },
  { name: "Supermercado", time_of_day: "tarde", weekdays: [], is_occasional: true, subtasks: [], category: "hogar", scheduled_date: null, monthly_day: null },
  { name: "Pagar cuentas", time_of_day: "tarde", weekdays: [], is_occasional: true, subtasks: [], category: "hogar", scheduled_date: null, monthly_day: 5 },
];

// Día de la semana ISO (1=Lunes..7=Domingo) a partir de un Date.
export function isoWeekday(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}

// Fecha de hoy en formato YYYY-MM-DD (hora local).
export function todayStr(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

// Fecha cualquiera en formato YYYY-MM-DD (hora local).
export function fmtDate(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

// Suma (o resta) días a una fecha YYYY-MM-DD.
export function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return fmtDate(d);
}

// ¿Esta rutina ocasional programada (fecha única o día del mes) toca en esa fecha?
export function occasionalDueOn(routine: Routine, dateStr: string): boolean {
  if (routine.scheduled_date) return routine.scheduled_date === dateStr;
  if (routine.monthly_day) {
    const day = Number(dateStr.slice(8, 10));
    return day === routine.monthly_day;
  }
  return false;
}

// ¿Tiene esta rutina ocasional una programación (fecha o día del mes)?
export function hasSchedule(routine: Routine): boolean {
  return routine.scheduled_date !== null || routine.monthly_day !== null;
}

// ¿Cuenta esta rutina como "hecha" ese día? Si tiene subtareas, deben
// estar todas marcadas; si no, basta con que exista la fila de completado.
export function isRoutineDone(
  routine: Routine,
  doneSubtasks: string[] | undefined,
  hasCompletionRow: boolean,
): boolean {
  if (routine.subtasks.length > 0) {
    const done = new Set(doneSubtasks ?? []);
    return routine.subtasks.every((s) => done.has(s));
  }
  return hasCompletionRow;
}
