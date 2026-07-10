import type {
  Goal,
  MonthPlan,
  WeekPlan,
  DayTask,
  PomodoroSession,
  Companion,
  CompanionProgress,
  CompanionRewardLog,
  AdventurerRewardLog,
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
  companionProgress: CompanionProgress[];
  companionRewardLogs: CompanionRewardLog[];
  adventurerRewardLogs: AdventurerRewardLog[];
  userProfiles: UserProfile[];
  weeklyReports: WeeklyReport[];
  exportedAt: string;
}
