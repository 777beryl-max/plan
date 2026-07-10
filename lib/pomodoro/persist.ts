import { DEFAULT_FOCUS_MINUTES, normalizeFocusMinutes } from "@/lib/pomodoro/duration";

const STORAGE_KEY = "bullet-plan-pomodoro";
const FOCUS_MINUTES_KEY = "bullet-plan-pomodoro-focus-minutes";

export interface PersistedPomodoro {
  phase: "focus" | "break";
  endsAt: number;
  focusStartedAt: number;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  focusMinutes: number;
  breakMinutes: number;
}

export function savePomodoroState(state: PersistedPomodoro): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadPomodoroState(): PersistedPomodoro | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedPomodoro;
    if (
      (parsed.phase === "focus" || parsed.phase === "break") &&
      typeof parsed.endsAt === "number"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearPomodoroState(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function saveFocusMinutesPreference(minutes: number): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(FOCUS_MINUTES_KEY, String(normalizeFocusMinutes(minutes)));
}

export function loadFocusMinutesPreference(): number {
  if (typeof localStorage === "undefined") return DEFAULT_FOCUS_MINUTES;
  try {
    const raw = localStorage.getItem(FOCUS_MINUTES_KEY);
    if (!raw) return DEFAULT_FOCUS_MINUTES;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return DEFAULT_FOCUS_MINUTES;
    return normalizeFocusMinutes(parsed);
  } catch {
    return DEFAULT_FOCUS_MINUTES;
  }
}
