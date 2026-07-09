"use client";

import { useState } from "react";
import { getISOWeek, getYear } from "date-fns";
import { useAppStore } from "@/stores/appStore";
import { generateWeeklyReport } from "@/lib/weekly-report";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { WeeklyPoster } from "@/components/achievements/WeeklyPoster";
import type { WeeklyReport } from "@/lib/types";

export default function AchievementsPage() {
  const weeklyReports = useAppStore((s) => s.weeklyReports);
  const saveReport = useAppStore((s) => s.saveReport);
  const loadWeeklyReports = useAppStore((s) => s.loadWeeklyReports);

  const [generating, setGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<WeeklyReport | null>(null);

  const currentWeek = getISOWeek(new Date());
  const currentYear = getYear(new Date());

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const report = await generateWeeklyReport(new Date());
      if (report) {
        await saveReport(report);
        setCurrentReport(report);
        await loadWeeklyReports();
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <PixelCard title="🏆 週冒險戰報" accent>
        <p className="font-body text-sm text-[var(--pixel-text-muted)] mb-3">
          願你的每一步專注，都讓人生目標更接近現實。本週也請繼續加油，冒險者！
        </p>
        <PixelButton onClick={handleGenerate} disabled={generating} className="w-full">
          {generating ? "生成中..." : `生成本週戰報（第 ${currentWeek} 週）`}
        </PixelButton>
      </PixelCard>

      {(currentReport ||
        weeklyReports.find((r) => r.year === currentYear && r.week === currentWeek)) && (
        <WeeklyPoster
          report={
            currentReport ??
            weeklyReports.find((r) => r.year === currentYear && r.week === currentWeek)!
          }
        />
      )}

      {weeklyReports.length > 0 && (
        <PixelCard title="歷史戰報">
          <ul className="space-y-2">
            {weeklyReports.map((report) => (
              <li key={report.id}>
                <button
                  onClick={() => setCurrentReport(report)}
                  className="w-full text-left border-4 border-[var(--pixel-border)] p-3 bg-[var(--pixel-bg)] hover:border-[var(--pixel-accent)] transition-colors"
                >
                  <span className="text-label text-[var(--pixel-accent)]">
                    第 {report.week} 週
                  </span>
                  <span className="font-body text-sm ml-2">
                    {report.completedCount}/{report.plannedCount} 任務 ·{" "}
                    {report.focusMinutes} 分鐘專注
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PixelCard>
      )}
    </div>
  );
}
