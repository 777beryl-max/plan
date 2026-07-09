import Dexie, { type Table } from "dexie";
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

export class BulletPlanDB extends Dexie {
  goals!: Table<Goal>;
  monthPlans!: Table<MonthPlan>;
  weekPlans!: Table<WeekPlan>;
  dayTasks!: Table<DayTask>;
  pomodoroSessions!: Table<PomodoroSession>;
  companions!: Table<Companion>;
  userProfiles!: Table<UserProfile>;
  weeklyReports!: Table<WeeklyReport>;

  constructor() {
    super("BulletPlanDB");
    this.version(1).stores({
      goals: "id, isActive, sortOrder, updatedAt",
      monthPlans: "id, goalId, year, month, updatedAt",
      weekPlans: "id, goalId, year, week, updatedAt",
      dayTasks: "id, goalId, weekPlanId, date, status, scheduledAt, updatedAt",
      pomodoroSessions: "id, taskId, startedAt, updatedAt",
      companions: "id, updatedAt",
      userProfiles: "id, updatedAt",
      weeklyReports: "id, year, week, updatedAt",
    });
  }
}

let db: BulletPlanDB | null = null;

export function getDB(): BulletPlanDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!db) {
    db = new BulletPlanDB();
  }
  return db;
}
