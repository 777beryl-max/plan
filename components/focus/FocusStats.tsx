"use client";

import { useMemo } from "react";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { PixelCard } from "@/components/ui/PixelCard";
import { formatMinutes } from "@/lib/utils";

export function FocusStats() {
  const sessions = usePomodoroStore((s) => s.sessions);
  const focusMinutes = usePomodoroStore((s) => s.focusMinutes);

  const today = useMemo(
    () => usePomodoroStore.getState().getTodayStats(),
    [sessions, focusMinutes]
  );
  const week = useMemo(
    () => usePomodoroStore.getState().getWeekStats(),
    [sessions, focusMinutes]
  );

  return (
    <PixelCard title="📊 專注統計">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-label text-[var(--pixel-text-muted)]">今日</p>
          <p className="font-body text-xl text-[var(--pixel-accent)]">
            {formatMinutes(today.minutes)}
          </p>
          <p className="font-body text-base text-[var(--pixel-text-muted)]">
            {today.sessions} 次專注
          </p>
        </div>
        <div>
          <p className="text-label text-[var(--pixel-text-muted)]">本週</p>
          <p className="font-body text-xl text-[var(--pixel-mp)]">
            {formatMinutes(week.minutes)}
          </p>
          <p className="font-body text-base text-[var(--pixel-text-muted)]">
            {week.sessions} 次專注
          </p>
        </div>
      </div>

      <div className="mt-4 border-4 border-[var(--pixel-border)] p-3 bg-[var(--pixel-bg)]">
        <div className="flex justify-between font-body text-base mb-1">
          <span>本週進度</span>
          <span>{week.sessions} / 20 次</span>
        </div>
        <div className="h-4 bg-[var(--pixel-surface)] border-2 border-[var(--pixel-border)]">
          <div
            className="h-full bg-[var(--pixel-accent)] transition-all"
            style={{ width: `${Math.min((week.sessions / 20) * 100, 100)}%` }}
          />
        </div>
      </div>
    </PixelCard>
  );
}
