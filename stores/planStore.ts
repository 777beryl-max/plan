import { create } from "zustand";
import { format, startOfWeek, getISOWeek, getYear } from "date-fns";
import type { MonthPlan, WeekPlan, DayTask } from "@/lib/types";
import {
  getMonthPlans,
  saveMonthPlan,
  getWeekPlans,
  saveWeekPlan,
  getDayTasks,
  saveDayTask,
  deleteDayTask,
  createDayTask,
} from "@/lib/repositories";
import { createBaseEntity } from "@/lib/utils";
import { normalizeMonthTargets, normalizeWeekTargets } from "@/lib/rules/plan";
import { syncMonthPlanToWeekPlan, syncWeekPlanToDayTasks, ensureWeekPlanTasksForDate } from "@/lib/plan-sync";

interface PlanStore {
  currentDate: Date;
  monthPlans: MonthPlan[];
  weekPlans: WeekPlan[];
  dayTasks: DayTask[];
  loading: boolean;
  setCurrentDate: (date: Date) => void;
  loadMonthPlans: () => Promise<void>;
  loadWeekPlans: () => Promise<void>;
  loadDayTasks: () => Promise<void>;
  loadAll: () => Promise<void>;
  saveMonthPlanForGoal: (goalId: string, targets: string[]) => Promise<void>;
  saveWeekPlanForGoal: (goalId: string, targets: string[]) => Promise<void>;
  addDayTask: (title: string, goalId?: string, scheduledAt?: string, durationMin?: number) => Promise<void>;
  updateDayTask: (id: string, updates: Partial<DayTask>) => Promise<void>;
  removeDayTask: (id: string) => Promise<void>;
  toggleTaskDone: (id: string) => Promise<void>;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  currentDate: new Date(),
  monthPlans: [],
  weekPlans: [],
  dayTasks: [],
  loading: false,

  setCurrentDate: (date) => set({ currentDate: date }),

  loadMonthPlans: async () => {
    const { currentDate } = get();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const plans = await getMonthPlans(year, month);
    set({ monthPlans: plans });
  },

  loadWeekPlans: async () => {
    const { currentDate } = get();
    const year = getYear(currentDate);
    const week = getISOWeek(currentDate);
    const plans = await getWeekPlans(year, week);
    set({ weekPlans: plans });
  },

  loadDayTasks: async () => {
    const { currentDate } = get();
    await ensureWeekPlanTasksForDate(currentDate);
    const date = format(currentDate, "yyyy-MM-dd");
    const tasks = await getDayTasks(date);
    set({ dayTasks: tasks });
  },

  loadAll: async () => {
    set({ loading: true });
    await Promise.all([
      get().loadMonthPlans(),
      get().loadWeekPlans(),
      get().loadDayTasks(),
    ]);
    set({ loading: false });
  },

  saveMonthPlanForGoal: async (goalId, targets) => {
    const { currentDate, monthPlans } = get();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const existing = monthPlans.find((p) => p.goalId === goalId);
    const normalized = normalizeMonthTargets(targets);

    const plan: MonthPlan = existing
      ? { ...existing, targets: normalized }
      : {
          ...createBaseEntity(),
          goalId,
          year,
          month,
          targets: normalized,
        };

    await saveMonthPlan(plan);
    const weekPlan = await syncMonthPlanToWeekPlan(plan, currentDate);
    if (weekPlan) {
      await syncWeekPlanToDayTasks(weekPlan, currentDate);
    }
    await get().loadMonthPlans();
    await get().loadWeekPlans();
    await get().loadDayTasks();
  },

  saveWeekPlanForGoal: async (goalId, targets) => {
    const { currentDate, weekPlans } = get();
    const year = getYear(currentDate);
    const week = getISOWeek(currentDate);
    const existing = weekPlans.find((p) => p.goalId === goalId);
    const normalized = normalizeWeekTargets(targets);

    const plan: WeekPlan = existing
      ? { ...existing, targets: normalized }
      : {
          ...createBaseEntity(),
          goalId,
          year,
          week,
          targets: normalized,
        };

    await saveWeekPlan(plan);
    await syncWeekPlanToDayTasks(plan, currentDate);
    await get().loadWeekPlans();
    await get().loadDayTasks();
  },

  addDayTask: async (title, goalId, scheduledAt, durationMin = 30) => {
    const { currentDate } = get();
    const date = format(currentDate, "yyyy-MM-dd");
    await createDayTask({ title, goalId, date, scheduledAt, durationMin });
    await get().loadDayTasks();
  },

  updateDayTask: async (id, updates) => {
    const task = get().dayTasks.find((t) => t.id === id);
    if (!task) return;
    await saveDayTask({ ...task, ...updates });
    await get().loadDayTasks();
  },

  removeDayTask: async (id) => {
    await deleteDayTask(id);
    await get().loadDayTasks();
  },

  toggleTaskDone: async (id) => {
    const task = get().dayTasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "done" ? "pending" : "done";
    await saveDayTask({ ...task, status: newStatus });
    await get().loadDayTasks();
  },
}));

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}
