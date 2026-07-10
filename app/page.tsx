"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { usePlanStore } from "@/stores/planStore";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useCompanionStore } from "@/stores/companionStore";
import { useAppStore } from "@/stores/appStore";
import { useActiveGoals } from "@/hooks/useActiveGoals";
import { getWeekStageIndex, WEEK_STAGE_LABELS } from "@/lib/rules/plan";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { CompanionSprite } from "@/components/companion/CompanionSprite";
import { formatMinutes } from "@/lib/utils";
import { COMPANION_SPECIES, type CompanionMood, type CompanionSpecies } from "@/lib/types";

const MOOD_LABELS: Record<CompanionMood, string> = {
  idle: "休息中",
  happy: "開心",
  cheering: "超興奮",
  sleepy: "想睡了",
};

const PORTALS = [
  { href: "/plan", label: "計畫", icon: "📜", desc: "月週日" },
  { href: "/goals", label: "目標", icon: "⚔️", desc: "主線" },
  { href: "/focus", label: "專注", icon: "⏱️", desc: "副本" },
  { href: "/achievements", label: "戰報", icon: "🏆", desc: "成就" },
] as const;

export default function DashboardPage() {
  const activeGoals = useActiveGoals();
  const dayTasks = usePlanStore((s) => s.dayTasks);
  const toggleTaskDone = usePlanStore((s) => s.toggleTaskDone);
  const sessions = usePomodoroStore((s) => s.sessions);
  const focusMinutes = usePomodoroStore((s) => s.focusMinutes);
  const companion = useCompanionStore((s) => s.companion);
  const profile = useAppStore((s) => s.profile);

  const today = new Date();
  const stageIndex = getWeekStageIndex(today);
  const todayStats = useMemo(() => {
    return usePomodoroStore.getState().getTodayStats();
  }, [sessions, focusMinutes]);

  const pendingTasks = dayTasks.filter((t) => t.status !== "done");
  const doneTasks = dayTasks.filter((t) => t.status === "done");
  const taskProgress = dayTasks.length > 0 ? Math.round((doneTasks.length / dayTasks.length) * 100) : 0;
  const focusProgress = Math.min(Math.round((todayStats.minutes / 120) * 100), 100);
  const speciesInfo = COMPANION_SPECIES.find((s) => s.id === companion?.species);
  const displayName = profile?.displayName ?? "冒險者";

  return (
    <div className="space-y-5">
      <BaseGreeting
        name={displayName}
        dateLabel={format(today, "M月 d日 EEEE", { locale: zhTW })}
        stageLabel={WEEK_STAGE_LABELS[stageIndex]}
        stageNumber={stageIndex + 1}
      />

      <SquadScene
        profile={profile}
        displayName={displayName}
        companion={companion}
        speciesLabel={speciesInfo?.label}
        moodLabel={companion ? MOOD_LABELS[companion.mood] : undefined}
      />

      <StatusBars
        taskDone={doneTasks.length}
        taskTotal={dayTasks.length}
        taskProgress={taskProgress}
        focusMinutes={todayStats.minutes}
        focusSessions={todayStats.sessions}
        focusProgress={focusProgress}
      />

      <QuickPortals />

      <PixelCard title="今日討伐" accent>
        {dayTasks.length === 0 ? (
          <div className="text-center py-5 border-[3px] border-dashed border-[var(--pixel-border-soft)] rounded-2xl bg-white/60">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="font-body text-lg text-[var(--pixel-text-muted)]">今日尚無怪物</p>
            <Link href="/plan" className="inline-block mt-3">
              <PixelButton size="sm">前往日計畫</PixelButton>
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {pendingTasks.slice(0, 5).map((task) => (
                <li
                  key={task.id}
                  className="quest-item flex items-center gap-3 p-3"
                >
                  <button
                    onClick={() => toggleTaskDone(task.id)}
                    className="shrink-0 w-10 h-10 flex items-center justify-center border-[3px] border-[var(--pixel-border)] rounded-xl bg-gradient-to-b from-[#ffe566] to-[var(--pixel-accent)] text-lg hover:scale-105 transition-transform"
                    title="擊敗怪物"
                  >
                    ⚔️
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-lg truncate">{task.title}</p>
                    {task.weekPlanId && (
                      <span className="text-label text-[var(--pixel-mp)]">主線</span>
                    )}
                  </div>
                </li>
              ))}
              {doneTasks.slice(0, 3).map((task) => (
                <li
                  key={task.id}
                  className="quest-item quest-item-done flex items-center gap-3 p-3 opacity-80"
                >
                  <span className="shrink-0 w-11 h-11 flex items-center justify-center text-xl text-[var(--pixel-success)]">
                    ✓
                  </span>
                  <p className="font-body text-lg line-through text-[var(--pixel-text-muted)] truncate">
                    {task.title}
                  </p>
                </li>
              ))}
            </ul>
            {(pendingTasks.length > 5 || doneTasks.length > 3) && (
              <p className="font-body text-base text-[var(--pixel-text-muted)] mt-3 text-center">
                還有更多任務待查看
              </p>
            )}
            <Link href="/plan" className="block mt-3">
              <PixelButton variant="ghost" size="sm" className="w-full">
                查看完整日計畫 →
              </PixelButton>
            </Link>
          </>
        )}
      </PixelCard>

      <PixelCard title={`進行中主線 · ${activeGoals.length} 項`}>
        {activeGoals.length === 0 ? (
          <div className="flex items-center justify-between gap-3">
            <p className="font-body text-lg text-[var(--pixel-text-muted)]">尚未啟動冒險目標</p>
            <Link href="/goals">
              <PixelButton size="sm">啟動目標</PixelButton>
            </Link>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {activeGoals.map((goal, i) => (
              <div
                key={goal.id}
                className="shrink-0 w-40 border-[3px] border-[var(--pixel-gold-dark)] rounded-xl bg-gradient-to-b from-white to-[var(--pixel-surface-2)] p-3"
              >
                <p className="text-label text-[var(--pixel-mp)] mb-1.5">Lv.{i + 1}</p>
                <p className="font-body text-lg leading-snug line-clamp-2">{goal.title}</p>
              </div>
            ))}
          </div>
        )}
      </PixelCard>

      <Link href="/focus">
        <PixelButton className="w-full" size="lg">
          ⏱️ 進入專注副本
        </PixelButton>
      </Link>
    </div>
  );
}

function BaseGreeting({
  name,
  dateLabel,
  stageLabel,
  stageNumber,
}: {
  name: string;
  dateLabel: string;
  stageLabel: string;
  stageNumber: number;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早安" : hour < 18 ? "午安" : "晚安";

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-body text-sm text-[var(--pixel-text-muted)]">{dateLabel}</p>
        <h2 className="text-display text-[var(--pixel-text)] mt-1">
          {greeting}，{name}
          <span className="twinkle ml-1">✨</span>
        </h2>
      </div>
      <div className="text-right shrink-0">
        <span className="stage-badge text-label px-3 py-1.5 inline-block">
          關卡 {stageNumber}
        </span>
        <p className="font-body text-sm text-[var(--pixel-text-muted)] mt-1.5">{stageLabel}</p>
      </div>
    </div>
  );
}

function SquadScene({
  profile,
  displayName,
  companion,
  speciesLabel,
  moodLabel,
}: {
  profile: { aiCharacterUrl?: string; displayName?: string } | null;
  displayName: string;
  companion: { species: CompanionSpecies; mood: CompanionMood; name: string } | null;
  speciesLabel?: string;
  moodLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-display text-[var(--pixel-accent)] flex items-center gap-2">
        <span>🏠</span> 冒險者基地
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <SquadSection
          title="隊長"
          borderAccent="accent"
          image={
            profile?.aiCharacterUrl ? (
              <img
                src={profile.aiCharacterUrl}
                alt="冒險角色"
                className="w-[7.5rem] h-[7.5rem] border-4 border-[var(--pixel-border)] object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div className="w-[7.5rem] h-[7.5rem] border-[3px] border-dashed border-[var(--pixel-border-soft)] rounded-2xl bg-white/70 flex items-center justify-center">
                <span className="text-4xl opacity-50">🧙</span>
              </div>
            )
          }
          name={displayName}
          detail={profile?.aiCharacterUrl ? undefined : "尚未覺醒"}
        />

        <SquadSection
          title="夥伴"
          borderAccent="mp"
          image={
            companion ? (
              <CompanionSprite species={companion.species} mood={companion.mood} size="md" />
            ) : (
              <div className="w-24 h-24 border-[3px] border-dashed border-[var(--pixel-border-soft)] rounded-2xl bg-white/70 flex items-center justify-center">
                <span className="text-2xl opacity-40">🐾</span>
              </div>
            )
          }
          name={companion?.name ?? "尚未結伴"}
          detail={
            companion ? `${speciesLabel} · ${moodLabel}` : "還沒有夥伴"
          }
          action={
            <Link href="/companion" className="inline-block mt-3">
              <span className="text-label px-4 py-2 rounded-full border-[3px] border-[var(--pixel-mp)] text-[var(--pixel-border)] bg-gradient-to-b from-[#b8f0eb] to-[var(--pixel-mp)] hover:brightness-105 transition-all">
                {companion ? "互動 →" : "選擇夥伴 →"}
              </span>
            </Link>
          }
        />
      </div>
    </div>
  );
}

function SquadSection({
  title,
  borderAccent,
  image,
  name,
  detail,
  action,
}: {
  title: string;
  borderAccent: "accent" | "mp";
  image: ReactNode;
  name: string;
  detail?: string;
  action?: ReactNode;
}) {
  const borderClass =
    borderAccent === "accent"
      ? "border-[var(--pixel-gold-dark)]"
      : "border-[var(--pixel-mp)]";

  return (
    <section
      className={`squad-panel pixel-card border-[3px] ${borderClass} p-4 h-full`}
    >
      <p className="text-label text-[var(--pixel-text-muted)] mb-3">{title}</p>
      <div className="flex items-center gap-4">
        <div className="shrink-0">{image}</div>
        <div className="min-w-0 flex-1">
          <p className="text-display text-[var(--pixel-accent)] break-words">
            {name}
          </p>
          {detail && (
            <p className="font-body text-base text-[var(--pixel-text-muted)] mt-1">{detail}</p>
          )}
          {action}
        </div>
      </div>
    </section>
  );
}

function StatusBars({
  taskDone,
  taskTotal,
  taskProgress,
  focusMinutes,
  focusSessions,
  focusProgress,
}: {
  taskDone: number;
  taskTotal: number;
  taskProgress: number;
  focusMinutes: number;
  focusSessions: number;
  focusProgress: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="pixel-card border-[3px] border-[var(--pixel-border-soft)] p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label text-[var(--pixel-hp)]">❤️ 討伐</span>
          <span className="font-body text-sm font-bold text-[var(--pixel-text-muted)]">
            {taskDone}/{taskTotal}
          </span>
        </div>
        <div className="game-stat-bar">
          <div
            className="game-stat-fill game-stat-fill-hp"
            style={{ width: `${taskProgress}%` }}
          />
        </div>
      </div>

      <div className="pixel-card border-[3px] border-[var(--pixel-border-soft)] p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label text-[var(--pixel-mp)]">💧 專注</span>
          <span className="font-body text-sm font-bold text-[var(--pixel-text-muted)]">
            {formatMinutes(focusMinutes)}
          </span>
        </div>
        <div className="game-stat-bar">
          <div
            className="game-stat-fill game-stat-fill-mp"
            style={{ width: `${focusProgress}%` }}
          />
        </div>
        <p className="font-body text-sm text-[var(--pixel-text-muted)] mt-2">
          {focusSessions} 次副本
        </p>
      </div>
    </div>
  );
}

function QuickPortals() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {PORTALS.map((portal) => (
        <Link
          key={portal.href}
          href={portal.href}
          className="portal-tile pixel-card flex flex-col items-center gap-1.5 border-[3px] border-[var(--pixel-border-soft)] p-3 text-center"
        >
          <span className="text-3xl leading-none">{portal.icon}</span>
          <span className="text-label text-[var(--pixel-accent)]">{portal.label}</span>
          <span className="font-body text-base text-[var(--pixel-text-muted)]">{portal.desc}</span>
        </Link>
      ))}
    </div>
  );
}
