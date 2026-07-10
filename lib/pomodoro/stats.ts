import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from "date-fns";
import type { PomodoroSession } from "@/lib/types";

export interface FocusStatsSummary {
  minutes: number;
  sessions: number;
}

function completedSessions(sessions: PomodoroSession[]): PomodoroSession[] {
  return sessions.filter((s) => s.completed);
}

function sumSessionMinutes(sessions: PomodoroSession[]): number {
  return sessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
}

export function computeTodayFocusStats(
  sessions: PomodoroSession[],
  referenceDate = new Date()
): FocusStatsSummary {
  const interval = { start: startOfDay(referenceDate), end: endOfDay(referenceDate) };
  const todaySessions = completedSessions(sessions).filter((s) =>
    isWithinInterval(parseISO(s.startedAt), interval)
  );
  return {
    minutes: sumSessionMinutes(todaySessions),
    sessions: todaySessions.length,
  };
}

export function computeWeekFocusStats(
  sessions: PomodoroSession[],
  referenceDate = new Date()
): FocusStatsSummary {
  const interval = {
    start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
    end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
  };
  const weekSessions = completedSessions(sessions).filter((s) =>
    isWithinInterval(parseISO(s.startedAt), interval)
  );
  return {
    minutes: sumSessionMinutes(weekSessions),
    sessions: weekSessions.length,
  };
}
