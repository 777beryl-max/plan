import { create } from "zustand";
import { format } from "date-fns";
import type { UserProfile, WeeklyReport, AdventurerRewardSourceType } from "@/lib/types";
import {
  getUserProfile,
  saveUserProfile,
  getWeeklyReports,
  saveWeeklyReport,
  getWeeklyReport,
  hasAdventurerRewardLog,
  saveAdventurerRewardLog,
  clearAdventurerRewardLogs,
  clearGoalsAndPlans,
} from "@/lib/repositories";
import { getDB } from "@/lib/db/dexie";
import { createBaseEntity, nowISO } from "@/lib/utils";
import { ADVENTURER_XP_AMOUNTS } from "@/lib/adventurer/rewards";
import { persistAvatarImageUrl } from "@/lib/avatar/persist-image";

interface AppStore {
  profile: UserProfile | null;
  weeklyReports: WeeklyReport[];
  loading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  grantAdventurerXp: (
    sourceType: AdventurerRewardSourceType,
    sourceId: string
  ) => Promise<boolean>;
  resetGoalsAndPlans: () => Promise<void>;
  loadWeeklyReports: () => Promise<void>;
  saveReport: (report: WeeklyReport) => Promise<void>;
  getReport: (year: number, week: number) => Promise<WeeklyReport | undefined>;
}

async function migrateAdventurerXp(profile: UserProfile): Promise<UserProfile> {
  if (profile.adventurerXpMigrated) return profile;

  let xp = profile.adventurerXp ?? 0;
  const db = getDB();
  const doneTasks = await db.dayTasks.filter((t) => t.status === "done").toArray();
  const sessions = await db.pomodoroSessions.filter((s) => s.completed).toArray();

  for (const task of doneTasks) {
    if (await hasAdventurerRewardLog("task", task.id)) continue;
    xp += ADVENTURER_XP_AMOUNTS.task;
    await saveAdventurerRewardLog({
      ...createBaseEntity(),
      sourceType: "task",
      sourceId: task.id,
      xpAmount: ADVENTURER_XP_AMOUNTS.task,
      rewardedAt: format(new Date(), "yyyy-MM-dd"),
    });
  }

  for (const session of sessions) {
    if (await hasAdventurerRewardLog("focus", session.id)) continue;
    xp += ADVENTURER_XP_AMOUNTS.focus;
    await saveAdventurerRewardLog({
      ...createBaseEntity(),
      sourceType: "focus",
      sourceId: session.id,
      xpAmount: ADVENTURER_XP_AMOUNTS.focus,
      rewardedAt: format(new Date(), "yyyy-MM-dd"),
    });
  }

  const updated: UserProfile = {
    ...profile,
    adventurerXp: xp,
    adventurerXpMigrated: true,
    updatedAt: nowISO(),
  };
  await saveUserProfile(updated);
  return updated;
}

export const useAppStore = create<AppStore>((set, get) => ({
  profile: null,
  weeklyReports: [],
  loading: false,

  loadProfile: async () => {
    set({ loading: true });
    let profile = await getUserProfile();
    profile = await migrateAdventurerXp(profile);

    if (profile.aiCharacterUrl && !profile.aiCharacterUrl.startsWith("data:")) {
      const dataUrl = await persistAvatarImageUrl(profile.aiCharacterUrl);
      if (dataUrl) {
        profile = {
          ...profile,
          aiCharacterUrl: dataUrl,
          updatedAt: nowISO(),
        };
        await saveUserProfile(profile);
      }
    }

    set({ profile, loading: false });
  },

  updateProfile: async (updates) => {
    const profile = get().profile ?? (await getUserProfile());
    const updated = { ...profile, ...updates };
    await saveUserProfile(updated);
    set({ profile: updated });
  },

  grantAdventurerXp: async (sourceType, sourceId) => {
    const alreadyRewarded = await hasAdventurerRewardLog(sourceType, sourceId);
    if (alreadyRewarded) return false;

    const profile = get().profile ?? (await getUserProfile());
    const amount = ADVENTURER_XP_AMOUNTS[sourceType];
    const updated: UserProfile = {
      ...profile,
      adventurerXp: (profile.adventurerXp ?? 0) + amount,
      updatedAt: nowISO(),
    };

    await saveUserProfile(updated);
    await saveAdventurerRewardLog({
      ...createBaseEntity(),
      sourceType,
      sourceId,
      xpAmount: amount,
      rewardedAt: format(new Date(), "yyyy-MM-dd"),
    });

    set({ profile: updated });
    return true;
  },

  resetGoalsAndPlans: async () => {
    await clearGoalsAndPlans();

    const { useGoalStore } = await import("@/stores/goalStore");
    useGoalStore.setState({ goals: [], loading: false, error: null });

    const { usePlanStore } = await import("@/stores/planStore");
    usePlanStore.setState({ monthPlans: [], weekPlans: [], dayTasks: [], loading: false });

    const { usePomodoroStore } = await import("@/stores/pomodoroStore");
    usePomodoroStore.setState({ activeTaskId: null, activeTaskTitle: null });

    try {
      const { useAuthStore } = await import("@/stores/authStore");
      if (useAuthStore.getState().user) {
        await useAuthStore.getState().pushToServer();
      }
    } catch {
      /* 離線時略過同步 */
    }
  },

  loadWeeklyReports: async () => {
    const reports = await getWeeklyReports();
    set({ weeklyReports: reports });
  },

  saveReport: async (report) => {
    await saveWeeklyReport(report);
    await get().loadWeeklyReports();
  },

  getReport: async (year, week) => getWeeklyReport(year, week),
}));
