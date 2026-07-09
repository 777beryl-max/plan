import {
  format,
  startOfWeek,
  endOfWeek,
  getISOWeek,
  getYear,
} from "date-fns";
import type { WeeklyReport } from "@/lib/types";
import {
  getDayTasksInRange,
  getPomodoroSessions,
  getAllGoals,
  getWeeklyReport,
} from "@/lib/repositories";
import { createBaseEntity } from "@/lib/utils";

export async function generateWeeklyReport(
  referenceDate: Date = new Date()
): Promise<WeeklyReport | null> {
  const year = getYear(referenceDate);
  const week = getISOWeek(referenceDate);

  const existing = await getWeeklyReport(year, week);

  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

  const startDate = format(weekStart, "yyyy-MM-dd");
  const endDate = format(weekEnd, "yyyy-MM-dd");

  const tasks = await getDayTasksInRange(startDate, endDate);
  const sessions = await getPomodoroSessions();
  const goals = await getAllGoals();

  const weekSessions = sessions.filter((s) => {
    const d = s.startedAt.split("T")[0];
    return d >= startDate && d <= endDate;
  });

  const plannedCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const focusMinutes = weekSessions.reduce((sum, s) => sum + s.durationMin, 0);

  const goalStats = goals
    .filter((g) => g.isActive)
    .map((goal) => {
      const goalTasks = tasks.filter((t) => t.goalId === goal.id);
      return {
        goalId: goal.id,
        goalTitle: goal.title,
        planned: goalTasks.length,
        completed: goalTasks.filter((t) => t.status === "done").length,
      };
    });

  const report: WeeklyReport = existing
    ? {
        ...existing,
        plannedCount,
        completedCount,
        focusMinutes,
        goalStats,
      }
    : {
        ...createBaseEntity(),
        year,
        week,
        plannedCount,
        completedCount,
        focusMinutes,
        goalStats,
      };

  return report;
}

export function getCompletionRate(planned: number, completed: number): number {
  if (planned === 0) return 0;
  return Math.round((completed / planned) * 100);
}

export function getShareText(report: WeeklyReport): string {
  const rate = getCompletionRate(report.plannedCount, report.completedCount);
  return `🎮 人生冒險遊戲 · 第 ${report.week} 週冒險戰報\n完成率：${rate}%\n任務：${report.completedCount}/${report.plannedCount}\n專注：${report.focusMinutes} 分鐘\n\n把人生目標，變成能完成的日常 ⚔️`;
}
