import { create } from "zustand";
import type { DayTask } from "@/lib/types";
import {
  saveDayTask,
  savePomodoroSession,
  getPomodoroSessions,
} from "@/lib/repositories";
import { createBaseEntity } from "@/lib/utils";
import { DEFAULT_FOCUS_MINUTES, normalizeFocusMinutes } from "@/lib/pomodoro/duration";
import {
  clearPomodoroState,
  loadPomodoroState,
  savePomodoroState,
  loadFocusMinutesPreference,
  saveFocusMinutesPreference,
} from "@/lib/pomodoro/persist";
import {
  requestPomodoroNotificationPermission,
  showPomodoroNotification,
} from "@/lib/pomodoro/notify";
import { preparePomodoroAudio, playPomodoroCompleteSound } from "@/lib/pomodoro/sound";
import { computeTodayFocusStats, computeWeekFocusStats } from "@/lib/pomodoro/stats";

export type PomodoroPhase = "idle" | "focus" | "break";

const FOCUS_MINUTES = DEFAULT_FOCUS_MINUTES;
const BREAK_MINUTES = 5;

interface PomodoroStore {
  phase: PomodoroPhase;
  secondsLeft: number;
  endsAt: number | null;
  focusMinutes: number;
  breakMinutes: number;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  focusStartedAt: number | null;
  sessions: Awaited<ReturnType<typeof getPomodoroSessions>>;
  tickerId: ReturnType<typeof setInterval> | null;
  completing: boolean;
  loadSessions: () => Promise<void>;
  initPreferences: () => void;
  hydrate: () => void;
  setActiveTask: (task: DayTask | null) => void;
  setFocusMinutes: (minutes: number) => void;
  startFocus: () => void;
  startBreak: () => void;
  pause: () => void;
  reset: () => void;
  syncTimer: () => void;
  completeSession: (snapshot?: {
    activeTaskId: string | null;
    focusMinutes: number;
    focusStartedAt: number | null;
  }) => Promise<void>;
  advanceToNextTask: () => Promise<void>;
  prepareNextRound: () => void;
  getTodayStats: () => { minutes: number; sessions: number };
  getWeekStats: () => { minutes: number; sessions: number };
}

function secondsUntil(endsAt: number): number {
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

function startTicker(get: () => PomodoroStore, set: (partial: Partial<PomodoroStore>) => void) {
  const { tickerId } = get();
  if (tickerId) clearInterval(tickerId);
  const id = setInterval(() => get().syncTimer(), 1000);
  set({ tickerId: id });
}

function stopTicker(get: () => PomodoroStore, set: (partial: Partial<PomodoroStore>) => void) {
  const { tickerId } = get();
  if (tickerId) clearInterval(tickerId);
  set({ tickerId: null });
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  phase: "idle",
  secondsLeft: FOCUS_MINUTES * 60,
  endsAt: null,
  focusMinutes: FOCUS_MINUTES,
  breakMinutes: BREAK_MINUTES,
  activeTaskId: null,
  activeTaskTitle: null,
  focusStartedAt: null,
  sessions: [],
  tickerId: null,
  completing: false,

  loadSessions: async () => {
    const sessions = await getPomodoroSessions();
    set({ sessions });
  },

  initPreferences: () => {
    if (get().phase !== "idle") return;
    const minutes = loadFocusMinutesPreference();
    set({ focusMinutes: minutes, secondsLeft: minutes * 60 });
  },

  hydrate: () => {
    const saved = loadPomodoroState();
    if (!saved) return;

    const left = secondsUntil(saved.endsAt);
    set({
      phase: saved.phase,
      endsAt: saved.endsAt,
      secondsLeft: left,
      activeTaskId: saved.activeTaskId,
      activeTaskTitle: saved.activeTaskTitle,
      focusMinutes: saved.focusMinutes,
      breakMinutes: saved.breakMinutes,
      focusStartedAt: saved.focusStartedAt ?? null,
    });

    if (left > 0) {
      startTicker(get, set);
    } else {
      get().syncTimer();
    }
  },

  setFocusMinutes: (minutes) => {
    if (get().phase !== "idle") return;
    const normalized = normalizeFocusMinutes(minutes);
    saveFocusMinutesPreference(normalized);
    set({ focusMinutes: normalized, secondsLeft: normalized * 60 });
  },

  setActiveTask: (task) => {
    set({
      activeTaskId: task?.id ?? null,
      activeTaskTitle: task?.title ?? null,
    });
  },

  startFocus: () => {
    const { focusMinutes, activeTaskId, activeTaskTitle, breakMinutes } = get();
    const focusStartedAt = Date.now();
    const endsAt = focusStartedAt + focusMinutes * 60 * 1000;

    savePomodoroState({
      phase: "focus",
      endsAt,
      focusStartedAt,
      activeTaskId,
      activeTaskTitle,
      focusMinutes,
      breakMinutes,
    });

    set({
      phase: "focus",
      endsAt,
      focusStartedAt,
      secondsLeft: focusMinutes * 60,
    });

    startTicker(get, set);
    preparePomodoroAudio();
    void requestPomodoroNotificationPermission();
  },

  startBreak: () => {
    const { breakMinutes, activeTaskId, activeTaskTitle, focusMinutes } = get();
    const focusStartedAt = Date.now();
    const endsAt = focusStartedAt + breakMinutes * 60 * 1000;

    savePomodoroState({
      phase: "break",
      endsAt,
      focusStartedAt,
      activeTaskId,
      activeTaskTitle,
      focusMinutes,
      breakMinutes,
    });

    set({
      phase: "break",
      endsAt,
      focusStartedAt,
      secondsLeft: breakMinutes * 60,
    });

    startTicker(get, set);
  },

  pause: () => {
    stopTicker(get, set);
    clearPomodoroState();
    set({
      phase: "idle",
      endsAt: null,
      focusStartedAt: null,
      secondsLeft: get().focusMinutes * 60,
    });
  },

  reset: () => {
    stopTicker(get, set);
    clearPomodoroState();
    set({
      phase: "idle",
      endsAt: null,
      focusStartedAt: null,
      secondsLeft: get().focusMinutes * 60,
      completing: false,
    });
  },

  prepareNextRound: () => {
    clearPomodoroState();
    set({
      phase: "idle",
      endsAt: null,
      focusStartedAt: null,
      secondsLeft: get().focusMinutes * 60,
    });
  },

  advanceToNextTask: async () => {
    const completedId = get().activeTaskId;
    const { usePlanStore } = await import("@/stores/planStore");
    const tasks = usePlanStore.getState().dayTasks;
    const pending = tasks.filter((t) => t.status !== "done");

    if (pending.length === 0) {
      set({ activeTaskId: null, activeTaskTitle: null });
      return;
    }

    if (!completedId) {
      set({ activeTaskId: pending[0].id, activeTaskTitle: pending[0].title });
      return;
    }

    const idx = tasks.findIndex((t) => t.id === completedId);
    for (let i = idx + 1; i < tasks.length; i++) {
      if (tasks[i].status !== "done") {
        set({ activeTaskId: tasks[i].id, activeTaskTitle: tasks[i].title });
        return;
      }
    }
    for (let i = 0; i < idx; i++) {
      if (tasks[i].status !== "done") {
        set({ activeTaskId: tasks[i].id, activeTaskTitle: tasks[i].title });
        return;
      }
    }
    set({ activeTaskId: pending[0].id, activeTaskTitle: pending[0].title });
  },

  syncTimer: () => {
    const { phase, endsAt, completing, focusMinutes } = get();
    if (phase === "idle" || !endsAt || completing) return;

    const left = secondsUntil(endsAt);
    set({ secondsLeft: left });

    if (left > 0) return;

    stopTicker(get, set);

    if (phase === "focus") {
      playPomodoroCompleteSound();
      const snapshot = {
        activeTaskId: get().activeTaskId,
        activeTaskTitle: get().activeTaskTitle,
        focusMinutes: get().focusMinutes,
        focusStartedAt: get().focusStartedAt,
      };
      set({ completing: true });
      get().prepareNextRound();
      void get()
        .completeSession(snapshot)
        .then(() => get().advanceToNextTask())
        .finally(() => set({ completing: false }));
      return;
    }

    if (phase === "break") {
      get().prepareNextRound();
      void showPomodoroNotification("休息結束！", "準備好下一場戰鬥了嗎？");
    }
  },

  completeSession: async (snapshot?: {
    activeTaskId: string | null;
    focusMinutes: number;
    focusStartedAt: number | null;
  }) => {
    const activeTaskId = snapshot?.activeTaskId ?? get().activeTaskId;
    const focusMinutes = snapshot?.focusMinutes ?? get().focusMinutes;
    const focusStartedAt = snapshot?.focusStartedAt ?? get().focusStartedAt;
    const startedAt = focusStartedAt
      ? new Date(focusStartedAt).toISOString()
      : new Date(Date.now() - focusMinutes * 60 * 1000).toISOString();

    const session = {
      ...createBaseEntity(),
      taskId: activeTaskId ?? "unassigned",
      startedAt,
      durationMin: focusMinutes,
      completed: true,
    };
    await savePomodoroSession(session);

    if (activeTaskId) {
      const { usePlanStore } = await import("@/stores/planStore");
      const planStore = usePlanStore.getState();
      const task = planStore.dayTasks.find((t) => t.id === activeTaskId);
      if (task) {
        const wasPending = task.status !== "done";
        await saveDayTask({
          ...task,
          status: "done",
          pomodoroSessions: task.pomodoroSessions + 1,
        });
        await planStore.loadDayTasks();
        if (wasPending) {
          const { useCompanionStore } = await import("@/stores/companionStore");
          await useCompanionStore.getState().grantTreatReward("task", activeTaskId);

          const { useAppStore } = await import("@/stores/appStore");
          await useAppStore.getState().grantAdventurerXp("task", activeTaskId);
        }
      }
    }

    await get().loadSessions();

    try {
      const { useAuthStore } = await import("@/stores/authStore");
      if (useAuthStore.getState().user) {
        await useAuthStore.getState().pushToServer();
      }
    } catch {
      /* 離線時略過同步 */
    }

    await showPomodoroNotification("專注完成！", "任務已自動標記完成 ⚔️");

    const { useCompanionStore } = await import("@/stores/companionStore");
    const companionStore = useCompanionStore.getState();
    await companionStore.grantTreatReward("focus", session.id);
    await companionStore.updateMoodFromActivity();

    const { useAppStore } = await import("@/stores/appStore");
    await useAppStore.getState().grantAdventurerXp("focus", session.id);
  },

  getTodayStats: () => computeTodayFocusStats(get().sessions),

  getWeekStats: () => computeWeekFocusStats(get().sessions),
}));

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
