"use client";

import type { DayTask } from "@/lib/types";

const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

interface TimeGridProps {
  tasks: DayTask[];
  onSchedule: (taskId: string, time: string, durationMin: number) => void;
}

export function TimeGrid({ tasks, onSchedule }: TimeGridProps) {
  const unscheduled = tasks.filter((t) => !t.scheduledAt && t.status !== "done");
  const scheduled = tasks.filter((t) => t.scheduledAt);
  const nowHour = new Date().getHours();

  const getTasksAtSlot = (slot: string) => {
    const hour = parseInt(slot.split(":")[0]);
    return tasks.filter((t) => {
      if (!t.scheduledAt) return false;
      const taskHour = new Date(t.scheduledAt).getHours();
      return taskHour === hour;
    });
  };

  return (
    <div className="pixel-card border-4 border-[var(--pixel-border)] bg-[var(--pixel-surface)] p-4 h-fit lg:sticky lg:top-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-pixel text-lg text-[var(--pixel-accent)]">🕐 冒險時程表</h3>
        <span className="font-body text-base text-[var(--pixel-text-muted)]">
          已排程 {scheduled.length} / {tasks.length}
        </span>
      </div>

      {unscheduled.length > 0 && (
        <div className="mb-4 p-3 border-4 border-dashed border-[var(--pixel-text-muted)]/50 bg-[var(--pixel-bg)]/50">
          <p className="text-label text-[var(--pixel-text-muted)] mb-2">待排程</p>
          <div className="space-y-2">
            {unscheduled.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <span className="font-body text-base flex-1 truncate">{task.title}</span>
                <select
                  className="shrink-0 bg-[var(--pixel-bg)] border-2 border-[var(--pixel-border)] text-base px-2 py-1 font-body max-w-[120px]"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onSchedule(task.id, e.target.value, task.durationMin);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">排程...</option>
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="font-body text-lg text-[var(--pixel-text-muted)] text-center py-8">
          尚無任務可排程
        </p>
      ) : (
        <div className="space-y-0.5 max-h-[min(420px,60vh)] overflow-y-auto border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg)]">
          {SLOTS.map((slot) => {
            const hour = parseInt(slot.split(":")[0]);
            const slotTasks = getTasksAtSlot(slot);
            const isNow = hour === nowHour;

            return (
              <div
                key={slot}
                className={`flex items-stretch min-h-[40px] border-b border-[var(--pixel-border)]/50 ${
                  slotTasks.length > 0
                    ? "bg-[var(--pixel-accent)]/10"
                    : isNow
                      ? "bg-[var(--pixel-mp)]/10"
                      : ""
                }`}
              >
                <span
                  className={`font-body text-base w-14 shrink-0 py-2 px-2 border-r border-[var(--pixel-border)]/50 flex items-center ${
                    isNow ? "text-[var(--pixel-accent)] font-bold" : "text-[var(--pixel-text-muted)]"
                  }`}
                >
                  {slot}
                </span>

                <div className="flex-1 flex gap-1 p-1 min-w-0">
                  {slotTasks.length === 0 ? (
                    <span className="flex-1 font-body text-base text-[var(--pixel-text-muted)]/30 py-2 px-2 flex items-center">
                      —
                    </span>
                  ) : (
                    slotTasks.map((task) => (
                      <span
                        key={task.id}
                        title={task.title}
                        className={`flex-1 min-w-0 truncate font-body text-base px-2 py-2 border-2 border-[var(--pixel-border)] ${
                          task.status === "done"
                            ? "bg-[var(--pixel-success)]/30 line-through opacity-70"
                            : task.weekPlanId
                              ? "bg-[var(--pixel-mp)]/30"
                              : "bg-[var(--pixel-surface)]"
                        }`}
                        style={
                          slotTasks.length > 1
                            ? { flex: `${Math.max(task.durationMin, 15)} 1 0%` }
                            : undefined
                        }
                      >
                        {task.title}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
