import { fmtDate } from "./rutinas";

export type Badge = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  unlocked: boolean;
};

export type Achievements = {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  routinesCompleted: number;
  selfCareCompleted: number;
  badges: Badge[];
};

// Racha más larga de días consecutivos dentro de un conjunto de fechas.
function longestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0;
  const sorted = [...dates].sort();
  let best = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
      best = Math.max(best, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return best;
}

// Racha actual: días consecutivos hasta hoy (o hasta ayer si hoy no se ha registrado).
function currentStreak(dates: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(fmtDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(fmtDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function buildAchievements(params: {
  logDates: string[];
  routinesCompleted: number;
  selfCareCompleted: number;
}): Achievements {
  const dateSet = new Set(params.logDates);
  const totalDays = dateSet.size;
  const streak = currentStreak(dateSet);
  const best = longestStreak(dateSet);
  const { routinesCompleted, selfCareCompleted } = params;

  const badges: Badge[] = [
    {
      id: "primer-paso",
      emoji: "🌱",
      label: "Primer paso",
      description: "Tu primer registro diario",
      unlocked: totalDays >= 1,
    },
    {
      id: "una-semana",
      emoji: "📅",
      label: "Una semana",
      description: "7 días de registro",
      unlocked: totalDays >= 7,
    },
    {
      id: "un-mes",
      emoji: "🏆",
      label: "Un mes",
      description: "30 días de registro",
      unlocked: totalDays >= 30,
    },
    {
      id: "racha-fuego",
      emoji: "🔥",
      label: "Racha de fuego",
      description: "7 días seguidos registrando",
      unlocked: best >= 7,
    },
    {
      id: "cincuenta-rutinas",
      emoji: "💪",
      label: "50 rutinas",
      description: "50 rutinas completadas",
      unlocked: routinesCompleted >= 50,
    },
    {
      id: "autocuidado",
      emoji: "🧘",
      label: "Autocuidado",
      description: "10 rutinas de autocuidado",
      unlocked: selfCareCompleted >= 10,
    },
  ];

  return {
    currentStreak: streak,
    bestStreak: best,
    totalDays,
    routinesCompleted,
    selfCareCompleted,
    badges,
  };
}
