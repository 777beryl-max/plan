import { create } from "zustand";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import type { DayTask } from "@/lib/types";
import {
  saveDayTask,
  savePomodoroSession,
  getPomodoroSessions,
} from "@/lib/repositories";
import { createBaseEntity } from "@/lib/utils";

export type PomodoroPhase = "idle" | "focus" | "break";

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

interface PomodoroStore {
  phase: PomodoroPhase;
  secondsLeft: number;
  focusMinutes: number;
  breakMinutes: number;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  sessions: Awaited<ReturnType<typeof getPomodoroSessions>>;
  intervalId: ReturnType<typeof setInterval> | null;
  loadSessions: () => Promise<void>;
  setActiveTask: (task: DayTask | null) => void;
  startFocus: () => void;
  startBreak: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  completeSession: () => Promise<void>;
  getTodayStats: () => { minutes: number; sessions: number };
  getWeekStats: () => { minutes: number; sessions: number };
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  phase: "idle",
  secondsLeft: FOCUS_MINUTES * 60,
  focusMinutes: FOCUS_MINUTES,
  breakMinutes: BREAK_MINUTES,
  activeTaskId: null,
  activeTaskTitle: null,
  sessions: [],
  intervalId: null,

  loadSessions: async () => {
    const sessions = await getPomodoroSessions();
    set({ sessions });
  },

  setActiveTask: (task) => {
    set({
      activeTaskId: task?.id ?? null,
      activeTaskTitle: task?.title ?? null,
    });
  },

  startFocus: () => {
    const { intervalId, focusMinutes } = get();
    if (intervalId) clearInterval(intervalId);

    const id = setInterval(() => get().tick(), 1000);
    set({
      phase: "focus",
      secondsLeft: focusMinutes * 60,
      intervalId: id,
    });

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  },

  startBreak: () => {
    const { intervalId, breakMinutes } = get();
    if (intervalId) clearInterval(intervalId);

    const id = setInterval(() => get().tick(), 1000);
    set({
      phase: "break",
      secondsLeft: breakMinutes * 60,
      intervalId: id,
    });
  },

  pause: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ phase: "idle", intervalId: null });
  },

  reset: () => {
    const { intervalId, focusMinutes } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      phase: "idle",
      secondsLeft: focusMinutes * 60,
      intervalId: null,
    });
  },

  tick: () => {
    const { secondsLeft, phase, intervalId } = get();
    if (secondsLeft <= 1) {
      if (intervalId) clearInterval(intervalId);
      if (phase === "focus") {
        set({ intervalId: null });
        void get().completeSession().then(() => get().startBreak());
      } else if (phase === "break") {
        set({ phase: "idle", secondsLeft: get().focusMinutes * 60, intervalId: null });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("休息結束！", { body: "準備好下一場戰鬥了嗎？" });
        }
      }
      return;
    }
    set({ secondsLeft: secondsLeft - 1 });
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

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("專注完成！", { body: "任務已自動標記完成 ⚔️" });
    }

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
