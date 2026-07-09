export type SyncStatus = "local" | "synced" | "conflict";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface Goal extends BaseEntity {
  title: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface MonthPlan extends BaseEntity {
  goalId: string;
  year: number;
  month: number;
  targets: string[];
}

export interface WeekPlan extends BaseEntity {
  goalId: string;
  year: number;
  week: number;
  targets: string[];
}

export type TaskStatus = "pending" | "in_progress" | "done";

export interface DayTask extends BaseEntity {
  goalId?: string;
  weekPlanId?: string;
  title: string;
  date: string;
  scheduledAt?: string;
  durationMin: number;
  status: TaskStatus;
  pomodoroSessions: number;
}

export interface PomodoroSession extends BaseEntity {
  taskId: string;
  startedAt: string;
  durationMin: number;
  completed: boolean;
}

export type CompanionMood = "idle" | "happy" | "cheering" | "sleepy";
export type CompanionSpecies = "cat" | "dog" | "fox" | "rabbit" | "bear" | "owl";

export interface Companion extends BaseEntity {
  species: CompanionSpecies;
  name: string;
  mood: CompanionMood;
  lastInteractionAt: string;
}

export type CharacterStyle = "brave" | "healing" | "scholar";
export type CharacterGender = "male" | "female" | "neutral";

export interface UserProfile extends BaseEntity {
  displayName: string;
  aiCharacterUrl?: string;
  aiGeneratedAt?: string;
  characterStyle?: CharacterStyle;
  characterGender?: CharacterGender;
  onboardingDone: boolean;
}

export interface WeeklyReport extends BaseEntity {
  year: number;
  week: number;
  plannedCount: number;
  completedCount: number;
  focusMinutes: number;
  goalStats: { goalId: string; goalTitle: string; planned: number; completed: number }[];
  posterDataUrl?: string;
}

export const COMPANION_SPECIES: {
  id: CompanionSpecies;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { id: "cat", label: "貓咪", emoji: "🐱", color: "#f39c12" },
  { id: "dog", label: "狗狗", emoji: "🐶", color: "#e67e22" },
  { id: "fox", label: "狐狸", emoji: "🦊", color: "#e74c3c" },
  { id: "rabbit", label: "兔子", emoji: "🐰", color: "#fd79a8" },
  { id: "bear", label: "熊熊", emoji: "🐻", color: "#a0522d" },
  { id: "owl", label: "貓頭鷹", emoji: "🦉", color: "#8e44ad" },
];

export const CHARACTER_STYLES: { id: CharacterStyle; label: string; desc: string }[] = [
  { id: "brave", label: "勇敢", desc: "堅毅的冒險者" },
  { id: "healing", label: "治癒", desc: "溫柔的治癒師" },
  { id: "scholar", label: "學者", desc: "博學的智者" },
];

export const CHARACTER_GENDERS: { id: CharacterGender; label: string }[] = [
  { id: "male", label: "男性" },
  { id: "female", label: "女性" },
  { id: "neutral", label: "中性" },
];
