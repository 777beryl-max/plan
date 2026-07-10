export const FOCUS_DURATION_STEP = 5;
export const DEFAULT_FOCUS_MINUTES = 25;
export const MIN_FOCUS_MINUTES = 5;
export const MAX_FOCUS_MINUTES = 60;

export const FOCUS_DURATION_OPTIONS = Array.from(
  { length: (MAX_FOCUS_MINUTES - MIN_FOCUS_MINUTES) / FOCUS_DURATION_STEP + 1 },
  (_, i) => MIN_FOCUS_MINUTES + i * FOCUS_DURATION_STEP
);

export function normalizeFocusMinutes(minutes: number): number {
  const rounded = Math.round(minutes / FOCUS_DURATION_STEP) * FOCUS_DURATION_STEP;
  return Math.min(MAX_FOCUS_MINUTES, Math.max(MIN_FOCUS_MINUTES, rounded));
}
