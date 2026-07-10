"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePomodoroStore, formatTimer } from "@/stores/pomodoroStore";

export function PomodoroFloatingTimer() {
  const pathname = usePathname();
  const phase = usePomodoroStore((s) => s.phase);
  const secondsLeft = usePomodoroStore((s) => s.secondsLeft);
  const focusMinutes = usePomodoroStore((s) => s.focusMinutes);
  const breakMinutes = usePomodoroStore((s) => s.breakMinutes);

  if (phase === "idle" || pathname === "/focus") return null;

  const totalSeconds = phase === "focus" ? focusMinutes * 60 : breakMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const phaseLabel = phase === "focus" ? "專注中" : "休息中";

  return (
    <Link
      href="/focus"
      aria-label={`${phaseLabel} ${formatTimer(secondsLeft)}，前往專注頁`}
      className="fixed bottom-[5.75rem] right-4 z-50 flex items-center gap-2 rounded-full border-[3px] border-[var(--pixel-gold-dark)] bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm hover:brightness-105 transition-all"
    >
      <div
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--pixel-border)] pomodoro-ring"
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
      >
        <span className="text-lg leading-none" aria-hidden>
          {phase === "focus" ? "🍅" : "☕"}
        </span>
      </div>
      <div className="min-w-0 pr-1">
        <p className="text-label text-[var(--pixel-accent)] leading-none">{phaseLabel}</p>
        <p className="text-stat text-lg leading-tight mt-0.5">
          {formatTimer(secondsLeft)}
        </p>
      </div>
    </Link>
  );
}
