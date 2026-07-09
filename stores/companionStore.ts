import { create } from "zustand";
import { format } from "date-fns";
import type { Companion, CompanionMood, CompanionSpecies } from "@/lib/types";
import { getCompanion, saveCompanion, getDayTasks, getPomodoroSessions } from "@/lib/repositories";
import { createBaseEntity, nowISO } from "@/lib/utils";

const INTERACTION_MESSAGES: Record<string, string[]> = {
  pet: ["好舒服～", "蹭蹭～", "再摸一下嘛！", "呼嚕呼嚕..."],
  cheer: ["加油加油！", "你可以的！", "一起打怪吧！", "今天也要努力哦！"],
};

interface CompanionStore {
  companion: Companion | null;
  bubbleText: string | null;
  animating: boolean;
  loading: boolean;
  loadCompanion: () => Promise<void>;
  selectCompanion: (species: CompanionSpecies, name: string) => Promise<void>;
  interact: (type: "pet" | "cheer") => void;
  updateMoodFromActivity: () => Promise<void>;
  clearBubble: () => void;
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
  bubbleText: null,
  animating: false,
  loading: false,

  loadCompanion: async () => {
    set({ loading: true });
    const companion = await getCompanion();
    set({ companion: companion ?? null, loading: false });
    if (companion) {
      await get().updateMoodFromActivity();
    }
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
    set({ companion });
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
}));
