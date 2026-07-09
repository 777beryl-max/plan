import { create } from "zustand";
import type { Goal } from "@/lib/types";
import {
  getAllGoals,
  saveGoal,
  deleteGoal,
  createGoal as repoCreateGoal,
} from "@/lib/repositories";
import {
  canAddGoal,
  canActivateGoal,
  getActiveGoals,
  getPoolCount,
  getActiveCount,
  MAX_GOAL_POOL,
  MAX_ACTIVE_GOALS,
} from "@/lib/rules/goals";

interface GoalStore {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  loadGoals: () => Promise<void>;
  addGoal: (title: string, description: string) => Promise<boolean>;
  updateGoal: (id: string, updates: Partial<Pick<Goal, "title" | "description">>) => Promise<void>;
  toggleActive: (id: string) => Promise<boolean>;
  removeGoal: (id: string) => Promise<void>;
  getActive: () => Goal[];
  poolCount: () => number;
  activeCount: () => number;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  loadGoals: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await getAllGoals();
      set({ goals, loading: false });
    } catch {
      set({ loading: false, error: "無法載入目標" });
    }
  },

  addGoal: async (title, description) => {
    const { goals } = get();
    if (!canAddGoal(goals)) {
      set({ error: `目標池已滿（最多 ${MAX_GOAL_POOL} 個）` });
      return false;
    }
    await repoCreateGoal({ title, description, isActive: false });
    await get().loadGoals();
    set({ error: null });
    return true;
  },

  updateGoal: async (id, updates) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;
    await saveGoal({ ...goal, ...updates });
    await get().loadGoals();
  },

  toggleActive: async (id) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return false;

    if (!goal.isActive && !canActivateGoal(get().goals)) {
      set({ error: `最多同時啟動 ${MAX_ACTIVE_GOALS} 個目標，請先停用一個` });
      return false;
    }

    await saveGoal({ ...goal, isActive: !goal.isActive });
    await get().loadGoals();
    set({ error: null });
    return true;
  },

  removeGoal: async (id) => {
    await deleteGoal(id);
    await get().loadGoals();
  },

  getActive: () => getActiveGoals(get().goals),
  poolCount: () => getPoolCount(get().goals),
  activeCount: () => getActiveCount(get().goals),
}));
