// Utilidades compartidas para el módulo de rutinas.

export type TimeOfDay = "manana" | "tarde" | "noche";

export type Routine = {
  id: string;
  name: string;
  time_of_day: TimeOfDay;
  weekdays: number[]; // 1 = Lunes ... 7 = Domingo
  is_occasional: boolean;
  sort: number;
};

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
}[] = [
  { name: "Paseo de Lily", time_of_day: "manana", weekdays: [1, 2, 3, 4, 5, 6, 7], is_occasional: false },
  { name: "Cocinar", time_of_day: "tarde", weekdays: [1, 2, 3, 4, 5, 6, 7], is_occasional: false },
  { name: "Limpiar", time_of_day: "manana", weekdays: [1, 3, 5], is_occasional: false },
  { name: "Gimnasio", time_of_day: "manana", weekdays: [1, 3, 5], is_occasional: false },
  { name: "Lavar ropa", time_of_day: "manana", weekdays: [6], is_occasional: false },
  { name: "Preparar maletas", time_of_day: "manana", weekdays: [], is_occasional: true },
  { name: "Guardar maletas", time_of_day: "manana", weekdays: [], is_occasional: true },
  { name: "Comprar pasajes", time_of_day: "tarde", weekdays: [], is_occasional: true },
  { name: "Supermercado", time_of_day: "tarde", weekdays: [], is_occasional: true },
  { name: "Pagar cuentas", time_of_day: "tarde", weekdays: [], is_occasional: true },
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
