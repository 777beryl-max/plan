const STORAGE_KEY = "bullet-plan-pomodoro";

export interface PersistedPomodoro {
  phase: "focus" | "break";
  endsAt: number;
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
