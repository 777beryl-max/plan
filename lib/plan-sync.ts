import { addDays, format, startOfWeek, getISOWeek, getYear } from "date-fns";
import type { MonthPlan, WeekPlan, DayTask } from "@/lib/types";
import {
  getDayTasksInRange,
  saveDayTask,
  deleteDayTask,
  createDayTask,
  getWeekPlans,
  saveWeekPlan,
} from "@/lib/repositories";
import {
  WEEK_TARGET_COUNT,
  WEEK_STAGE_LABELS,
  getWeekStageIndex,
} from "@/lib/rules/plan";
import { createBaseEntity } from "@/lib/utils";

function findDayTaskForWeekSync(
  tasks: DayTask[],
  goalId: string,
  date: string,
  weekPlanId: string
): DayTask | undefined {
  return (
    tasks.find((t) => t.date === date && t.goalId === goalId && t.weekPlanId === weekPlanId) ??
    tasks.find((t) => t.date === date && t.goalId === goalId && t.weekPlanId)
  );
}

async function removeDuplicateWeekTasks(
  tasks: DayTask[],
  goalId: string,
  date: string,
  keepId: string
) {
  const dupes = tasks.filter(
    (t) => t.date === date && t.goalId === goalId && t.weekPlanId && t.id !== keepId
  );
  for (const task of dupes) {
    await deleteDayTask(task.id);
  }
}

/** 將月里程碑拆解為 4 個周關卡 */
export function splitMonthMilestoneToWeekTargets(milestone: string): string[] {
  const trimmed = milestone.trim();
  if (!trimmed) return Array(WEEK_TARGET_COUNT).fill("");
  return WEEK_STAGE_LABELS.map((label) => `${trimmed} · ${label}`);
}

/** 月計畫確認後，同步至本週周計畫 */
export async function syncMonthPlanToWeekPlan(
  monthPlan: MonthPlan,
  referenceDate: Date
): Promise<WeekPlan | null> {
  const milestone = monthPlan.targets[0]?.trim();
  if (!milestone) return null;

  const year = getYear(referenceDate);
  const week = getISOWeek(referenceDate);
  const weekTargets = splitMonthMilestoneToWeekTargets(milestone);

  const existingPlans = await getWeekPlans(year, week);
  const existing = existingPlans.find((p) => p.goalId === monthPlan.goalId);

  const plan: WeekPlan = existing
    ? { ...existing, targets: weekTargets }
    : {
        ...createBaseEntity(),
        goalId: monthPlan.goalId,
        year,
        week,
        targets: weekTargets,
      };

  await saveWeekPlan(plan);
  return plan;
}

/** 將本週對應關卡同步到週一～週七的日任務 */
export async function syncWeekPlanToDayTasks(
  plan: WeekPlan,
  referenceDate: Date
): Promise<void> {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const stageIndex = getWeekStageIndex(referenceDate);
  const title = plan.targets[stageIndex]?.trim() ?? "";
  const startDate = format(weekStart, "yyyy-MM-dd");
  const endDate = format(weekEnd, "yyyy-MM-dd");

  const weekTasks = await getDayTasksInRange(startDate, endDate);
  const linkedTasks = weekTasks.filter(
    (t) => t.weekPlanId === plan.id && t.goalId === plan.goalId
  );

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), "yyyy-MM-dd")
  );

  for (const date of weekDates) {
    const existing = findDayTaskForWeekSync(weekTasks, plan.goalId, date, plan.id);

    if (!title) {
      if (existing) await deleteDayTask(existing.id);
      continue;
    }

    if (existing) {
      if (existing.title !== title || existing.weekPlanId !== plan.id) {
        await saveDayTask({ ...existing, title, weekPlanId: plan.id });
      }
      await removeDuplicateWeekTasks(weekTasks, plan.goalId, date, existing.id);
    } else {
      const created = await createDayTask({
        title,
        goalId: plan.goalId,
        weekPlanId: plan.id,
        date,
        durationMin: 30,
      });
      await removeDuplicateWeekTasks(weekTasks, plan.goalId, date, created.id);
    }
  }

  for (const task of linkedTasks) {
    if (!weekDates.includes(task.date)) {
      await deleteDayTask(task.id);
    }
  }
}

/** 載入日計畫時，確保當日周計畫項目已寫入日任務 */
export async function ensureWeekPlanTasksForDate(referenceDate: Date): Promise<void> {
  const stageIndex = getWeekStageIndex(referenceDate);

  const year = getYear(referenceDate);
  const week = getISOWeek(referenceDate);
  const date = format(referenceDate, "yyyy-MM-dd");
  const weekPlans = await getWeekPlans(year, week);
  const dayTasks = await getDayTasksInRange(date, date);

  for (const plan of weekPlans) {
    const title = plan.targets[stageIndex]?.trim();
    if (!title) continue;

    const existing = findDayTaskForWeekSync(dayTasks, plan.goalId, date, plan.id);

    if (existing) {
      if (existing.title !== title || existing.weekPlanId !== plan.id) {
        await saveDayTask({ ...existing, title, weekPlanId: plan.id });
      }
      await removeDuplicateWeekTasks(dayTasks, plan.goalId, date, existing.id);
    } else {
      const created = await createDayTask({
        title,
        goalId: plan.goalId,
        weekPlanId: plan.id,
        date,
        durationMin: 30,
      });
      await removeDuplicateWeekTasks(dayTasks, plan.goalId, date, created.id);
    }
  }
}
