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

export interface UserDataBundle {
  goals: Goal[];
  monthPlans: MonthPlan[];
  weekPlans: WeekPlan[];
  dayTasks: DayTask[];
  pomodoroSessions: PomodoroSession[];
  companions: Companion[];
  userProfiles: UserProfile[];
  weeklyReports: WeeklyReport[];
  exportedAt: string;
}
