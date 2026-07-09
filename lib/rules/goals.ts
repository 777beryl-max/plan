import type { Goal } from "@/lib/types";

export const MAX_GOAL_POOL = 15;
export const MAX_ACTIVE_GOALS = 5;

export function canAddGoal(goals: Goal[]): boolean {
  return goals.length < MAX_GOAL_POOL;
}

export function canActivateGoal(goals: Goal[]): boolean {
  return goals.filter((g) => g.isActive).length < MAX_ACTIVE_GOALS;
}

export function getActiveGoals(goals: Goal[]): Goal[] {
  return goals.filter((g) => g.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPoolCount(goals: Goal[]): number {
  return goals.length;
}

export function getActiveCount(goals: Goal[]): number {
  return goals.filter((g) => g.isActive).length;
}
