import { useGoalStore } from "@/stores/goalStore";
import { usePlanStore } from "@/stores/planStore";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useCompanionStore } from "@/stores/companionStore";
import { useAppStore } from "@/stores/appStore";

export async function bootstrapStores() {
  await Promise.all([
    useGoalStore.getState().loadGoals(),
    usePlanStore.getState().loadAll(),
    usePomodoroStore.getState().loadSessions(),
    useCompanionStore.getState().loadCompanion(),
    useCompanionStore.getState().loadProgress(),
    useAppStore.getState().loadProfile(),
    useAppStore.getState().loadWeeklyReports(),
  ]);
}

/** Clear in-memory store state after logout. */
export function resetAllStores() {
  useGoalStore.setState({ goals: [], loading: false, error: null });
  usePlanStore.setState({
    monthPlans: [],
    weekPlans: [],
    dayTasks: [],
    loading: false,
  });
  usePomodoroStore.setState({ sessions: [] });
  useCompanionStore.setState({
    companion: null,
    progress: null,
    bubbleText: null,
    animating: false,
    loading: false,
    lastRewardToast: null,
  });
  useAppStore.setState({
    profile: null,
    weeklyReports: [],
    loading: false,
  });
}
