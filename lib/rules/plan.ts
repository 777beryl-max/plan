import { differenceInCalendarWeeks, startOfMonth, startOfWeek } from "date-fns";

export const MONTH_MILESTONE_COUNT = 1;
export const WEEK_TARGET_COUNT = 4;

export function emptyMonthTargets(): string[] {
  return Array(MONTH_MILESTONE_COUNT).fill("");
}

export function emptyWeekTargets(): string[] {
  return Array(WEEK_TARGET_COUNT).fill("");
}

export function normalizeMonthTargets(targets: string[]): string[] {
  const filled = targets.map((t) => t.trim()).filter(Boolean).slice(0, MONTH_MILESTONE_COUNT);
  return filled.length > 0 ? [filled[0]] : [];
}

export function normalizeWeekTargets(targets: string[]): string[] {
  const slots = emptyWeekTargets();
  targets.slice(0, WEEK_TARGET_COUNT).forEach((t, i) => {
    slots[i] = t.trim();
  });
  return slots;
}

/** 本月第幾週（週一～週日）→ 0-3，對應週計畫關卡 1-4 */
export function getWeekStageIndex(date: Date): number {
  const monthStart = startOfMonth(date);
  const monthFirstWeek = startOfWeek(monthStart, { weekStartsOn: 1 });
  const currentWeek = startOfWeek(date, { weekStartsOn: 1 });
  const weekOffset = differenceInCalendarWeeks(currentWeek, monthFirstWeek, {
    weekStartsOn: 1,
  });
  return Math.min(Math.max(weekOffset, 0), WEEK_TARGET_COUNT - 1);
}

export const WEEK_STAGE_LABELS = ["第1週", "第2週", "第3週", "第4週"] as const;
