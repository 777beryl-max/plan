"use client";

import { useState } from "react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { zhTW } from "date-fns/locale";
import { usePlanStore } from "@/stores/planStore";
import { PixelTabs } from "@/components/ui/PixelTabs";
import { MonthView } from "@/components/plan/MonthView";
import { WeekView } from "@/components/plan/WeekView";
import { DayView } from "@/components/plan/DayView";
import { PixelButton } from "@/components/ui/PixelButton";

type PlanTab = "month" | "week" | "day";

export default function PlanPage() {
  const [tab, setTab] = useState<PlanTab>("day");
  const currentDate = usePlanStore((s) => s.currentDate);
  const setCurrentDate = usePlanStore((s) => s.setCurrentDate);
  const loadAll = usePlanStore((s) => s.loadAll);

  const navigate = (direction: -1 | 1) => {
    let next: Date;
    if (tab === "month") {
      next = direction === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    } else if (tab === "week") {
      next = direction === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
    } else {
      next = direction === 1 ? addDays(currentDate, 1) : subDays(currentDate, 1);
    }
    setCurrentDate(next);
    setTimeout(() => loadAll(), 0);
  };

  const dateLabel = () => {
    if (tab === "month") return format(currentDate, "yyyy年 M月", { locale: zhTW });
    if (tab === "week") return `第 ${format(currentDate, "w")} 週 · ${format(currentDate, "yyyy")}`;
    return format(currentDate, "M月 d日 EEEE", { locale: zhTW });
  };

  return (
    <div className="space-y-5">
      <PixelTabs
        tabs={[
          { id: "month" as PlanTab, label: "月計畫" },
          { id: "week" as PlanTab, label: "周計畫" },
          { id: "day" as PlanTab, label: "日計畫" },
        ]}
        active={tab}
        onChange={(t) => {
          setTab(t);
          loadAll();
        }}
      />

      <div className="flex items-center justify-between">
        <PixelButton variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ◀
        </PixelButton>
        <span className="text-display text-[var(--pixel-accent)]">{dateLabel()}</span>
        <PixelButton variant="ghost" size="sm" onClick={() => navigate(1)}>
          ▶
        </PixelButton>
      </div>

      {tab === "month" && <MonthView />}
      {tab === "week" && <WeekView />}
      {tab === "day" && <DayView />}
    </div>
  );
}
