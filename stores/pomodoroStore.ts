import { create } from "zustand";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import type { DayTask } from "@/lib/types";
import {
  saveDayTask,
  savePomodoroSession,
  getPomodoroSessions,
} from "@/lib/repositories";
import { createBaseEntity } from "@/lib/utils";
import {
  clearPomodoroState,
  loadPomodoroState,
  savePomodoroState,
} from "@/lib/pomodoro/persist";
import {
  requestPomodoroNotificationPermission,
  showPomodoroNotification,
} from "@/lib/pomodoro/notify";

export type PomodoroPhase = "idle" | "focus" | "break";

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

interface PomodoroStore {
  phase: PomodoroPhase;
  secondsLeft: number;
  endsAt: number | null;
  focusMinutes: number;
  breakMinutes: number;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  sessions: Awaited<ReturnType<typeof getPomodoroSessions>>;
  tickerId: ReturnType<typeof setInterval> | null;
  completing: boolean;
  loadSessions: () => Promise<void>;
  hydrate: () => void;
  setActiveTask: (task: DayTask | null) => void;
  startFocus: () => void;
  startBreak: () => void;
  pause: () => void;
  reset: () => void;
  syncTimer: () => void;
  completeSession: () => Promise<void>;
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
  sessions: [],
  tickerId: null,
  completing: false,

  loadSessions: async () => {
    const sessions = await getPomodoroSessions();
    set({ sessions });
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
    });

    if (left > 0) {
      startTicker(get, set);
    } else {
      get().syncTimer();
    }
  },

  setActiveTask: (task) => {
    set({
      activeTaskId: task?.id ?? null,
      activeTaskTitle: task?.title ?? null,
    });
  },

  startFocus: () => {
    const { focusMinutes, activeTaskId, activeTaskTitle, breakMinutes } = get();
    const endsAt = Date.now() + focusMinutes * 60 * 1000;

    savePomodoroState({
      phase: "focus",
      endsAt,
      activeTaskId,
      activeTaskTitle,
      focusMinutes,
      breakMinutes,
    });

    set({
      phase: "focus",
      endsAt,
      secondsLeft: focusMinutes * 60,
    });

    startTicker(get, set);
    void requestPomodoroNotificationPermission();
  },

  startBreak: () => {
    const { breakMinutes, activeTaskId, activeTaskTitle, focusMinutes } = get();
    const endsAt = Date.now() + breakMinutes * 60 * 1000;

    savePomodoroState({
      phase: "break",
      endsAt,
      activeTaskId,
      activeTaskTitle,
      focusMinutes,
      breakMinutes,
    });

    set({
      phase: "break",
      endsAt,
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
      secondsLeft: get().focusMinutes * 60,
    });
  },

  reset: () => {
    stopTicker(get, set);
    clearPomodoroState();
    set({
      phase: "idle",
      endsAt: null,
      secondsLeft: get().focusMinutes * 60,
      completing: false,
    });
  },

  syncTimer: () => {
    const { phase, endsAt, completing, breakMinutes, focusMinutes } = get();
    if (phase === "idle" || !endsAt || completing) return;

    const left = secondsUntil(endsAt);
    set({ secondsLeft: left });

    if (left > 0) return;

    stopTicker(get, set);

    if (phase === "focus") {
      set({ completing: true });
      void get()
        .completeSession()
        .then(() => {
          set({ completing: false });
          const breakEndsAt = endsAt + breakMinutes * 60 * 1000;
          if (Date.now() >= breakEndsAt) {
            clearPomodoroState();
            set({
              phase: "idle",
              endsAt: null,
              secondsLeft: focusMinutes * 60,
            });
            void showPomodoroNotification("專注完成！", "休息也已結束，準備下一場吧！");
            return;
          }

          const {
            activeTaskId,
            activeTaskTitle,
            focusMinutes: fm,
            breakMinutes: bm,
          } = get();
          savePomodoroState({
            phase: "break",
            endsAt: breakEndsAt,
            activeTaskId,
            activeTaskTitle,
            focusMinutes: fm,
            breakMinutes: bm,
          });
          set({
            phase: "break",
            endsAt: breakEndsAt,
            secondsLeft: secondsUntil(breakEndsAt),
          });
          startTicker(get, set);
        })
        .catch(() => set({ completing: false }));
      return;
    }

    if (phase === "break") {
      clearPomodoroState();
      set({
        phase: "idle",
        endsAt: null,
        secondsLeft: get().focusMinutes * 60,
      });
      void showPomodoroNotification("休息結束！", "準備好下一場戰鬥了嗎？");
    }
  },

  completeSession: async () => {
    const { activeTaskId, focusMinutes } = get();

    const session = {
      ...createBaseEntity(),
      taskId: activeTaskId ?? "unassigned",
      startedAt: new Date().toISOString(),
      durationMin: focusMinutes,
      completed: true,
    };
    await savePomodoroSession(session);

    if (activeTaskId) {
      const { usePlanStore } = await import("@/stores/planStore");
      const planStore = usePlanStore.getState();
      const task = planStore.dayTasks.find((t) => t.id === activeTaskId);
      if (task) {
        await saveDayTask({
          ...task,
          status: "done",
          pomodoroSessions: task.pomodoroSessions + 1,
        });
        await planStore.loadDayTasks();
      }
    }

    await get().loadSessions();
    await showPomodoroNotification("專注完成！", "任務已自動標記完成 ⚔️");

    const { useCompanionStore } = await import("@/stores/companionStore");
    await useCompanionStore.getState().updateMoodFromActivity();
  },

  getTodayStats: () => {
    const { sessions, focusMinutes } = get();
    const today = new Date();
    const interval = { start: startOfDay(today), end: endOfDay(today) };
    const todaySessions = sessions.filter((s) =>
      isWithinInterval(parseISO(s.startedAt), interval)
    );
    return {
      minutes: todaySessions.length * focusMinutes,
      sessions: todaySessions.length,
    };
  },

  getWeekStats: () => {
    const { sessions, focusMinutes } = get();
    const today = new Date();
    const interval = {
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 }),
    };
    const weekSessions = sessions.filter((s) =>
      isWithinInterval(parseISO(s.startedAt), interval)
    );
    return {
      minutes: weekSessions.length * focusMinutes,
      sessions: weekSessions.length,
    };
  },
}));

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
