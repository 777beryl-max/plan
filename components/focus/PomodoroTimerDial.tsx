"use client";

import { useEffect, useRef, useState } from "react";
import { FOCUS_DURATION_OPTIONS } from "@/lib/pomodoro/duration";

interface PomodoroTimerDialProps {
  phase: "idle" | "focus" | "break";
  secondsLeft: number;
  focusMinutes: number;
  phaseLabel?: string;
  phaseColor: string;
  progress: number;
  onSelectMinutes: (minutes: number) => void;
  formatTimer: (seconds: number) => string;
}

export function PomodoroTimerDial({
  phase,
  secondsLeft,
  focusMinutes,
  phaseLabel,
  phaseColor,
  progress,
  onSelectMinutes,
  formatTimer,
}: PomodoroTimerDialProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  const canPickDuration = phase === "idle";

  useEffect(() => {
    if (!pickerOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!dialRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [pickerOpen]);

  const handleDialClick = () => {
    if (!canPickDuration) return;
    setPickerOpen(true);
  };

  const handleSelect = (minutes: number) => {
    onSelectMinutes(minutes);
    setPickerOpen(false);
  };

  return (
    <div ref={dialRef} className="relative">
      <div
        className="w-48 h-48 flex items-center justify-center border-[6px] border-[var(--pixel-border)] pomodoro-ring shadow-lg"
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={handleDialClick}
          disabled={!canPickDuration}
          aria-label={canPickDuration ? "選擇專注時間" : undefined}
          aria-expanded={canPickDuration ? pickerOpen : undefined}
          className={`w-40 h-40 rounded-full bg-white flex flex-col items-center justify-center border-[3px] border-[var(--pixel-border-soft)] transition-transform ${
            canPickDuration
              ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              : "cursor-default"
          }`}
        >
          <span className="text-stat text-2xl" style={{ color: phaseColor }}>
            {formatTimer(secondsLeft)}
          </span>
          {phase !== "idle" && phaseLabel && (
            <span className="font-body text-base text-[var(--pixel-text-muted)] mt-2">
              {phaseLabel}
            </span>
          )}
        </button>
      </div>

      {pickerOpen && (
        <div className="absolute left-1/2 top-full z-20 mt-3 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border-[3px] border-[var(--pixel-gold-dark)] bg-white p-3 shadow-lg">
          <p className="text-label text-[var(--pixel-text-muted)] text-center mb-2">
            專注時間（5 分鐘一格）
          </p>
          <div className="grid grid-cols-4 gap-2">
            {FOCUS_DURATION_OPTIONS.map((minutes) => {
              const selected = minutes === focusMinutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => handleSelect(minutes)}
                  className={`rounded-xl border-[3px] px-2 py-2 font-body text-sm font-bold transition-colors ${
                    selected
                      ? "border-[var(--pixel-gold-dark)] bg-gradient-to-b from-[#ffe566] to-[var(--pixel-accent)] text-[var(--pixel-border)]"
                      : "border-[var(--pixel-border-soft)] bg-[var(--pixel-surface-2)] text-[var(--pixel-text)] hover:bg-white"
                  }`}
                >
                  {minutes} 分
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
