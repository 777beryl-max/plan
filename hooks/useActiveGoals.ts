import { useMemo } from "react";
import { useGoalStore } from "@/stores/goalStore";
import { getActiveGoals } from "@/lib/rules/goals";

export function useActiveGoals() {
  const goals = useGoalStore((s) => s.goals);
  return useMemo(() => getActiveGoals(goals), [goals]);
}
