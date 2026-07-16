export type PeriodType = "vacaciones" | "viaje";

export type SpecialPeriod = {
  id: string;
  type: PeriodType;
  start_date: string;
  end_date: string;
  note: string | null;
};

export const PERIOD_LABELS: Record<PeriodType, string> = {
  vacaciones: "🏖️ Vacaciones",
  viaje: "💼 Viaje de trabajo",
};

export type HealthState = "enferma" | "spm" | "menstruacion";

export const HEALTH_LABELS: Record<HealthState, string> = {
  enferma: "🤒 Enferma",
  spm: "🌙 SPM",
  menstruacion: "🩸 Menstruación",
};

// ¿Esa fecha cae dentro del periodo (inclusive)?
export function isDateInPeriod(period: SpecialPeriod, dateStr: string): boolean {
  return dateStr >= period.start_date && dateStr <= period.end_date;
}

// Días que faltan para que empiece el periodo (0 = empieza hoy, negativo = ya empezó).
export function daysUntil(dateStr: string, fromStr: string): number {
  const a = new Date(fromStr + "T00:00:00");
  const b = new Date(dateStr + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
