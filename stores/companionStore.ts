import { create } from "zustand";
import { format } from "date-fns";
import type {
  Companion,
  CompanionMood,
  CompanionProgress,
  CompanionRewardSourceType,
  CompanionSpecies,
} from "@/lib/types";
import {
  getCompanion,
  saveCompanion,
  deleteCompanion,
  getDayTasks,
  getPomodoroSessions,
  getCompanionProgress,
  saveCompanionProgress,
  clearCompanionProgress,
  hasRewardLog,
  saveRewardLog,
  clearCompanionRewardLogs,
} from "@/lib/repositories";
import { createBaseEntity, nowISO } from "@/lib/utils";
import { getBondLevel } from "@/lib/companion/bond";
import { pickFeedLine } from "@/lib/companion/feed-lines";
import { BOND_XP_PER_FEED, TREAT_REWARD_AMOUNTS } from "@/lib/companion/rewards";
import { getTreatLabel } from "@/lib/companion/treats";

const INTERACTION_MESSAGES: Record<string, string[]> = {
  pet: ["好舒服～", "蹭蹭～", "再摸一下嘛！", "呼嚕呼嚕..."],
  cheer: ["加油加油！", "你可以的！", "一起打怪吧！", "今天也要努力哦！"],
};

export interface RewardToast {
  amount: number;
  label: string;
}

interface CompanionStore {
  companion: Companion | null;
  progress: CompanionProgress | null;
  bubbleText: string | null;
  animating: boolean;
  loading: boolean;
  lastRewardToast: RewardToast | null;
  loadCompanion: () => Promise<void>;
  loadProgress: () => Promise<void>;
  selectCompanion: (species: CompanionSpecies, name: string) => Promise<void>;
  replaceCompanion: (species: CompanionSpecies, name: string) => Promise<void>;
  clearCompanion: () => Promise<void>;
  interact: (type: "pet" | "cheer") => void;
  grantTreatReward: (
    sourceType: CompanionRewardSourceType,
    sourceId: string
  ) => Promise<boolean>;
  feed: () => Promise<boolean>;
  updateMoodFromActivity: () => Promise<void>;
  clearBubble: () => void;
  clearRewardToast: () => void;
}

function computeMood(tasksDone: number, pomodoroCount: number): CompanionMood {
  const score = tasksDone + pomodoroCount;
  if (score >= 5) return "cheering";
  if (score >= 2) return "happy";
  if (score === 0) return "sleepy";
  return "idle";
}

export const useCompanionStore = create<CompanionStore>((set, get) => ({
  companion: null,
  progress: null,
  bubbleText: null,
  animating: false,
  loading: false,
  lastRewardToast: null,

  loadCompanion: async () => {
    set({ loading: true });
    const companion = await getCompanion();
    set({ companion: companion ?? null, loading: false });
    if (companion) {
      await get().loadProgress();
      await get().updateMoodFromActivity();
    }
  },

  loadProgress: async () => {
    const progress = await getCompanionProgress();
    set({ progress });
  },

  selectCompanion: async (species, name) => {
    const companion: Companion = {
      ...createBaseEntity(),
      species,
      name,
      mood: "happy",
      lastInteractionAt: nowISO(),
    };
    await saveCompanion(companion);
    await get().loadProgress();
    set({ companion });
  },

  replaceCompanion: async (species, name) => {
    await deleteCompanion();
    await get().selectCompanion(species, name);
  },

  clearCompanion: async () => {
    await deleteCompanion();
    await clearCompanionProgress();
    await clearCompanionRewardLogs();
    set({ companion: null, progress: null, bubbleText: null, animating: false });
  },

  interact: (type) => {
    const messages = INTERACTION_MESSAGES[type];
    const text = messages[Math.floor(Math.random() * messages.length)];
    set({ bubbleText: text, animating: true });

    const companion = get().companion;
    if (companion) {
      saveCompanion({ ...companion, lastInteractionAt: nowISO(), mood: "happy" });
    }

    setTimeout(() => set({ animating: false }), 600);
    setTimeout(() => set({ bubbleText: null }), 3000);
  },

  grantTreatReward: async (sourceType, sourceId) => {
    const companion = get().companion ?? (await getCompanion());
    if (!companion) return false;

    const alreadyRewarded = await hasRewardLog(sourceType, sourceId);
    if (alreadyRewarded) return false;

    const amount = TREAT_REWARD_AMOUNTS[sourceType];
    const progress = get().progress ?? (await getCompanionProgress());
    const updatedProgress: CompanionProgress = {
      ...progress,
      treatCount: progress.treatCount + amount,
    };

    await saveCompanionProgress(updatedProgress);
    await saveRewardLog({
      ...createBaseEntity(),
      sourceType,
      sourceId,
      treatAmount: amount,
      rewardedAt: format(new Date(), "yyyy-MM-dd"),
    });

    set({
      progress: updatedProgress,
      lastRewardToast: {
        amount,
        label: getTreatLabel(companion.species),
      },
    });

    await get().updateMoodFromActivity();
    return true;
  },

  feed: async () => {
    const companion = get().companion ?? (await getCompanion());
    if (!companion) return false;

    const progress = get().progress ?? (await getCompanionProgress());
    if (progress.treatCount < 1) return false;

    const bondLevel = getBondLevel(progress.bondXp);
    const bubbleText = pickFeedLine(bondLevel);
    const updatedProgress: CompanionProgress = {
      ...progress,
      treatCount: progress.treatCount - 1,
      bondXp: progress.bondXp + BOND_XP_PER_FEED,
      totalFeeds: progress.totalFeeds + 1,
      lastFedAt: nowISO(),
    };

    const feedMood: CompanionMood = bondLevel >= 5 ? "cheering" : "happy";
    const updatedCompanion: Companion = {
      ...companion,
      mood: feedMood,
      lastInteractionAt: nowISO(),
    };

    await saveCompanionProgress(updatedProgress);
    await saveCompanion(updatedCompanion);

    set({
      progress: updatedProgress,
      companion: updatedCompanion,
      bubbleText,
      animating: true,
    });

    setTimeout(() => set({ animating: false }), bondLevel >= 2 ? 800 : 600);
    setTimeout(() => set({ bubbleText: null }), 3000);

    if (bondLevel < 5) {
      setTimeout(() => {
        void get().updateMoodFromActivity();
      }, 3200);
    }

    return true;
  },

  updateMoodFromActivity: async () => {
    const companion = get().companion ?? (await getCompanion());
    if (!companion) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const tasks = await getDayTasks(today);
    const tasksDone = tasks.filter((t) => t.status === "done").length;
    const sessions = await getPomodoroSessions();
    const todaySessions = sessions.filter((s) => s.startedAt.startsWith(today)).length;

    const mood = computeMood(tasksDone, todaySessions);
    if (companion.mood === mood) return;

    const updated = { ...companion, mood };
    await saveCompanion(updated);
    set({ companion: updated });
  },

  clearBubble: () => set({ bubbleText: null }),
  clearRewardToast: () => set({ lastRewardToast: null }),
}));
