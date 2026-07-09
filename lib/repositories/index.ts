import { getDB } from "@/lib/db/dexie";
import type {
  Goal,
  MonthPlan,
  WeekPlan,
  DayTask,
  PomodoroSession,
  Companion,
  UserProfile,
  WeeklyReport,
} from "@/lib/types";
import { createBaseEntity, nowISO } from "@/lib/utils";

const DEFAULT_USER_ID = "default-user";

let activeUserId = DEFAULT_USER_ID;

export function setActiveUserId(userId: string) {
  activeUserId = userId;
}

export function resetActiveUserId() {
  activeUserId = DEFAULT_USER_ID;
}

function getProfileId() {
  return activeUserId;
}

export async function getAllGoals(): Promise<Goal[]> {
  return getDB().goals.orderBy("sortOrder").toArray();
}

export async function saveGoal(goal: Goal): Promise<void> {
  await getDB().goals.put({ ...goal, updatedAt: nowISO() });
}

export async function deleteGoal(id: string): Promise<void> {
  await getDB().goals.delete(id);
}

export async function createGoal(data: Omit<Goal, keyof ReturnType<typeof createBaseEntity> | "sortOrder"> & { sortOrder?: number }): Promise<Goal> {
  const goals = await getAllGoals();
  const goal: Goal = {
    ...createBaseEntity(),
    sortOrder: data.sortOrder ?? goals.length,
    title: data.title,
    description: data.description,
    isActive: data.isActive,
  };
  await saveGoal(goal);
  return goal;
}

export async function getMonthPlans(year: number, month: number): Promise<MonthPlan[]> {
  return getDB().monthPlans.where({ year, month }).toArray();
}

export async function saveMonthPlan(plan: MonthPlan): Promise<void> {
  await getDB().monthPlans.put({ ...plan, updatedAt: nowISO() });
}

export async function getWeekPlans(year: number, week: number): Promise<WeekPlan[]> {
  return getDB().weekPlans.where({ year, week }).toArray();
}

export async function saveWeekPlan(plan: WeekPlan): Promise<void> {
  await getDB().weekPlans.put({ ...plan, updatedAt: nowISO() });
}

export async function getDayTasks(date: string): Promise<DayTask[]> {
  return getDB().dayTasks.where("date").equals(date).toArray();
}

export async function getDayTasksInRange(startDate: string, endDate: string): Promise<DayTask[]> {
  return getDB().dayTasks.where("date").between(startDate, endDate, true, true).toArray();
}

export async function saveDayTask(task: DayTask): Promise<void> {
  await getDB().dayTasks.put({ ...task, updatedAt: nowISO() });
}

export async function deleteDayTask(id: string): Promise<void> {
  await getDB().dayTasks.delete(id);
}

export async function createDayTask(
  data: Omit<DayTask, keyof ReturnType<typeof createBaseEntity> | "pomodoroSessions" | "status"> & {
    status?: DayTask["status"];
    pomodoroSessions?: number;
  }
): Promise<DayTask> {
  const task: DayTask = {
    ...createBaseEntity(),
    status: data.status ?? "pending",
    pomodoroSessions: data.pomodoroSessions ?? 0,
    goalId: data.goalId,
    weekPlanId: data.weekPlanId,
    title: data.title,
    date: data.date,
    scheduledAt: data.scheduledAt,
    durationMin: data.durationMin,
  };
  await saveDayTask(task);
  return task;
}

export async function getPomodoroSessions(): Promise<PomodoroSession[]> {
  return getDB().pomodoroSessions.toArray();
}

export async function savePomodoroSession(session: PomodoroSession): Promise<void> {
  await getDB().pomodoroSessions.put({ ...session, updatedAt: nowISO() });
}

export async function getCompanion(): Promise<Companion | undefined> {
  return getDB().companions.toCollection().first();
}

export async function saveCompanion(companion: Companion): Promise<void> {
  await getDB().companions.put({ ...companion, updatedAt: nowISO() });
}

export async function getUserProfile(): Promise<UserProfile> {
  const existing = await getDB().userProfiles.get(getProfileId());
  if (existing) return existing;

  const profile: UserProfile = {
    ...createBaseEntity(),
    id: getProfileId(),
    displayName: "冒險者",
    onboardingDone: false,
  };
  await getDB().userProfiles.put(profile);
  return profile;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await getDB().userProfiles.put({ ...profile, updatedAt: nowISO() });
}

export async function getWeeklyReports(): Promise<WeeklyReport[]> {
  return getDB().weeklyReports.orderBy("updatedAt").reverse().toArray();
}

export async function saveWeeklyReport(report: WeeklyReport): Promise<void> {
  await getDB().weeklyReports.put({ ...report, updatedAt: nowISO() });
}

export async function getWeeklyReport(year: number, week: number): Promise<WeeklyReport | undefined> {
  const reports = await getDB().weeklyReports.where({ year, week }).toArray();
  return reports[0];
}
