"use client";

import { useRef } from "react";
import type { WeeklyReport } from "@/lib/types";
import { getCompletionRate } from "@/lib/weekly-report";
import { ProgressChart } from "./ProgressChart";
import { useAppStore } from "@/stores/appStore";
import { useCompanionStore } from "@/stores/companionStore";
import { CompanionSprite } from "@/components/companion/CompanionSprite";

interface WeeklyPosterProps {
  report: WeeklyReport;
  onDownload?: () => void;
}

export function WeeklyPoster({ report }: WeeklyPosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const profile = useAppStore((s) => s.profile);
  const companion = useCompanionStore((s) => s.companion);
  const rate = getCompletionRate(report.plannedCount, report.completedCount);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(posterRef.current, {
      backgroundColor: "#2d1b4e",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `bullet-plan-week${report.week}-poster.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    const { getShareText } = await import("@/lib/weekly-report");
    const text = getShareText(report);
    if (navigator.share) {
      await navigator.share({ title: "週冒險戰報", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("戰報文字已複製到剪貼簿！");
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={posterRef}
        className="border-4 border-[var(--pixel-accent)] p-6 bg-[var(--pixel-bg)]"
        style={{ background: "linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)" }}
      >
        <div className="text-center mb-4">
          <p className="text-label text-[var(--pixel-accent)]">
            人生冒險遊戲
          </p>
          <h2 className="font-pixel text-sm text-white mt-2">
            第 {report.week} 週冒險戰報
          </h2>
          <p className="font-body text-base text-[var(--pixel-text-muted)] mt-1">
            {report.year} 年
          </p>
        </div>

        <div className="flex justify-center items-end gap-4 mb-4">
          {profile?.aiCharacterUrl && (
            <img
              src={profile.aiCharacterUrl}
              alt="角色"
              className="w-16 h-16 border-4 border-[var(--pixel-border)]"
              style={{ imageRendering: "pixelated" }}
            />
          )}
          {companion && (
            <div className="text-center flex flex-col items-center gap-1">
              <CompanionSprite
                species={companion.species}
                mood={companion.mood}
                size="sm"
              />
              <p className="font-body text-base text-[var(--pixel-text-muted)]">
                {companion.name}
              </p>
            </div>
          )}
        </div>

        <div className="text-center mb-4">
          <p className="font-pixel text-3xl text-[var(--pixel-accent)]">{rate}%</p>
          <p className="font-body text-base text-[var(--pixel-text-muted)]">完成率</p>
        </div>

        <ProgressChart planned={report.plannedCount} completed={report.completedCount} />

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="border-2 border-[var(--pixel-border)] p-2">
            <p className="font-body text-lg text-[var(--pixel-accent)]">
              {report.completedCount}
            </p>
            <p className="font-body text-base text-[var(--pixel-text-muted)]">完成</p>
          </div>
          <div className="border-2 border-[var(--pixel-border)] p-2">
            <p className="font-body text-lg text-[var(--pixel-mp)]">
              {report.plannedCount}
            </p>
            <p className="font-body text-base text-[var(--pixel-text-muted)]">預計</p>
          </div>
          <div className="border-2 border-[var(--pixel-border)] p-2">
            <p className="font-body text-lg text-[var(--pixel-success)]">
              {report.focusMinutes}
            </p>
            <p className="font-body text-base text-[var(--pixel-text-muted)]">專注分</p>
          </div>
        </div>

        {report.goalStats.length > 0 && (
          <div className="mt-4 border-t-2 border-[var(--pixel-border)] pt-3">
            <p className="text-label text-[var(--pixel-text-muted)] mb-2">
              各目標完成率
            </p>
            {report.goalStats.map((g) => (
              <div key={g.goalId} className="flex justify-between font-body text-base mb-1">
                <span className="truncate flex-1">{g.goalTitle}</span>
                <span className="text-[var(--pixel-accent)]">
                  {g.completed}/{g.planned}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="font-body text-base text-center text-[var(--pixel-text-muted)] mt-4">
          把人生目標，變成能完成的日常
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="pixel-btn flex-1 bg-[var(--pixel-accent)] text-[var(--pixel-border)] text-label py-2 px-4 border-4 border-[var(--pixel-border)]"
        >
          下載 PNG
        </button>
        <button
          onClick={handleShare}
          className="pixel-btn flex-1 bg-[var(--pixel-mp)] text-white text-label py-2 px-4 border-4 border-[var(--pixel-border)]"
        >
          分享戰報
        </button>
      </div>
    </div>
  );
}
