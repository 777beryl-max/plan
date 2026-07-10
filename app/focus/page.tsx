"use client";

import { useEffect } from "react";
import { usePlanStore } from "@/stores/planStore";
import { usePomodoroStore, formatTimer } from "@/stores/pomodoroStore";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { FocusStats } from "@/components/focus/FocusStats";

export default function FocusPage() {
  const dayTasks = usePlanStore((s) => s.dayTasks);
  const phase = usePomodoroStore((s) => s.phase);
  const secondsLeft = usePomodoroStore((s) => s.secondsLeft);
  const focusMinutes = usePomodoroStore((s) => s.focusMinutes);
  const activeTaskId = usePomodoroStore((s) => s.activeTaskId);
  const activeTaskTitle = usePomodoroStore((s) => s.activeTaskTitle);
  const setActiveTask = usePomodoroStore((s) => s.setActiveTask);
  const startFocus = usePomodoroStore((s) => s.startFocus);
  const pause = usePomodoroStore((s) => s.pause);
  const reset = usePomodoroStore((s) => s.reset);
  const loadSessions = usePomodoroStore((s) => s.loadSessions);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const pendingTasks = dayTasks.filter((t) => t.status !== "done");
  const progress =
    phase === "focus"
      ? ((focusMinutes * 60 - secondsLeft) / (focusMinutes * 60)) * 100
      : 0;

  const phaseLabel = {
    idle: "待機中",
    focus: "專注副本",
    break: "休息中",
  };

  const phaseColor = {
    idle: "var(--pixel-text-muted)",
    focus: "var(--pixel-accent)",
    break: "var(--pixel-mp)",
  };

  return (
    <div className="space-y-4">
      <PixelCard title="⏱️ 專注副本" accent>
        <div className="flex flex-col items-center py-6">
          <div
            className="w-48 h-48 flex items-center justify-center border-[6px] border-[var(--pixel-border)] pomodoro-ring shadow-lg"
            style={{ "--progress": `${progress}%` } as React.CSSProperties}
          >
            <div className="w-40 h-40 rounded-full bg-white flex flex-col items-center justify-center border-[3px] border-[var(--pixel-border-soft)]">
              <span
                className="font-pixel text-xl"
                style={{ color: phaseColor[phase] }}
              >
                {formatTimer(secondsLeft)}
              </span>
              <span className="font-body text-base text-[var(--pixel-text-muted)] mt-2">
                {phaseLabel[phase]}
              </span>
            </div>
          </div>

          {activeTaskTitle && (
            <p className="font-body text-lg text-[var(--pixel-accent)] mt-4 text-center">
              目標：擊敗 {activeTaskTitle}
            </p>
          )}

          <div className="flex gap-2 mt-6">
            {phase === "idle" ? (
              <PixelButton onClick={startFocus} size="lg">
                開始專注
              </PixelButton>
            ) : (
              <PixelButton onClick={pause} variant="secondary" size="lg">
                暫停
              </PixelButton>
            )}
            <PixelButton onClick={reset} variant="ghost" size="lg">
              重置
            </PixelButton>
          </div>

          {phase !== "idle" && (
            <p className="font-body text-sm text-[var(--pixel-text-muted)] mt-4 text-center max-w-xs">
              計時會在背景持續，螢幕關閉或切換 App 後回來會自動結算
            </p>
          )}
        </div>
      </PixelCard>

      <PixelCard title="綁定任務">
        {pendingTasks.length === 0 ? (
          <p className="font-body text-lg text-[var(--pixel-text-muted)]">
            今日無待完成任務
          </p>
        ) : (
          <ul className="space-y-2">
            {pendingTasks.map((task) => (
              <li key={task.id}>
                <button
                  onClick={() => setActiveTask(task)}
                  className={`w-full text-left quest-item p-3 font-body transition-colors ${
                    activeTaskId === task.id
                      ? "border-[var(--pixel-gold-dark)] bg-[var(--pixel-surface-2)]"
                      : ""
                  }`}
                >
                  ⚔️ {task.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>

      <FocusStats />
    </div>
  );
}
