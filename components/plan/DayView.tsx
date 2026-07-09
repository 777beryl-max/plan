"use client";



import { useEffect, useMemo, useState } from "react";

import { format } from "date-fns";

import { zhTW } from "date-fns/locale";

import { useActiveGoals } from "@/hooks/useActiveGoals";

import { usePlanStore } from "@/stores/planStore";

import { getWeekStageIndex, WEEK_STAGE_LABELS } from "@/lib/rules/plan";

import type { DayTask } from "@/lib/types";

import { PixelCard } from "@/components/ui/PixelCard";

import { PixelButton } from "@/components/ui/PixelButton";

import { PixelInput } from "@/components/ui/PixelInput";

import { TimeGrid } from "@/components/plan/TimeGrid";



export function DayView() {

  const activeGoals = useActiveGoals();

  const currentDate = usePlanStore((s) => s.currentDate);

  const weekPlans = usePlanStore((s) => s.weekPlans);

  const dayTasks = usePlanStore((s) => s.dayTasks);

  const loadDayTasks = usePlanStore((s) => s.loadDayTasks);

  const addDayTask = usePlanStore((s) => s.addDayTask);

  const toggleTaskDone = usePlanStore((s) => s.toggleTaskDone);

  const removeDayTask = usePlanStore((s) => s.removeDayTask);

  const updateDayTask = usePlanStore((s) => s.updateDayTask);



  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");

  const [goalId, setGoalId] = useState("");

  const [scheduledTime, setScheduledTime] = useState("");

  const [duration, setDuration] = useState("30");



  const dateStr = format(currentDate, "yyyy-MM-dd");

  const stageIndex = getWeekStageIndex(currentDate);

  const stageLabel = WEEK_STAGE_LABELS[stageIndex];



  const goalTitleById = useMemo(

    () => new Map(activeGoals.map((g) => [g.id, g.title])),

    [activeGoals]

  );



  useEffect(() => {

    void loadDayTasks();

  }, [currentDate, loadDayTasks]);



  const weekPlanItems = useMemo(() => {

    return activeGoals

      .map((goal) => {

        const plan = weekPlans.find((p) => p.goalId === goal.id);

        const target = plan?.targets[stageIndex]?.trim();

        if (!target) return null;

        return { goalId: goal.id, goalTitle: goal.title, target };

      })

      .filter(Boolean) as { goalId: string; goalTitle: string; target: string }[];

  }, [activeGoals, weekPlans, stageIndex]);



  const weekLinkedTasks = dayTasks.filter((t) => t.weekPlanId);

  const manualTasks = dayTasks.filter((t) => !t.weekPlanId);

  const doneCount = dayTasks.filter((t) => t.status === "done").length;

  const progress = dayTasks.length > 0 ? Math.round((doneCount / dayTasks.length) * 100) : 0;



  const handleAdd = async () => {

    if (!title.trim()) return;

    const scheduledAt = scheduledTime ? `${dateStr}T${scheduledTime}:00` : undefined;

    await addDayTask(title.trim(), goalId || undefined, scheduledAt, parseInt(duration) || 30);

    setTitle("");

    setScheduledTime("");

    setShowAddForm(false);

  };



  return (

    <div className="space-y-4">

      <DayStatusBar

        date={currentDate}

        stageLabel={stageLabel}

        stageNumber={stageIndex + 1}

        doneCount={doneCount}

        totalCount={dayTasks.length}

        progress={progress}

        mainQuestCount={weekPlanItems.length}

      />



      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">

        <div className="space-y-4">

          <PixelCard title="⚔️ 主線任務" accent={weekLinkedTasks.length > 0}>

            <p className="font-body text-base text-[var(--pixel-text-muted)] mb-3 -mt-1">

              本週 {stageLabel} 的關卡目標，週一～週日每日同步

            </p>



            {weekLinkedTasks.length > 0 ? (

              <ul className="space-y-2">

                {weekLinkedTasks.map((task) => (

                  <TaskRow

                    key={task.id}

                    task={task}

                    goalTitle={task.goalId ? goalTitleById.get(task.goalId) : undefined}

                    variant="main"

                    onToggle={toggleTaskDone}

                    onRemove={removeDayTask}

                  />

                ))}

              </ul>

            ) : weekPlanItems.length > 0 ? (

              <div className="space-y-2">

                {weekPlanItems.map((item) => (

                  <div

                    key={item.goalId}

                    className="border-4 border-dashed border-[var(--pixel-mp)]/40 bg-[var(--pixel-bg)]/50 p-3"

                  >

                    <p className="font-body text-base text-[var(--pixel-mp)] mb-1">{item.goalTitle}</p>

                    <p className="font-body text-lg">{item.target}</p>

                    <p className="font-body text-base text-[var(--pixel-text-muted)] mt-2">

                      尚未同步至今日任務，請至周計畫重新確認

                    </p>

                  </div>

                ))}

              </div>

            ) : (

              <EmptyHint

                icon="🗺️"

                message="本週尚無主線關卡"

                hint="請先在周計畫設定關卡，或從月計畫同步"

              />

            )}

          </PixelCard>



          <PixelCard title="📜 支線任務">

            <div className="flex items-center justify-between gap-2 mb-3 -mt-1">

              <p className="font-body text-base text-[var(--pixel-text-muted)]">

                自行安排的額外打怪任務

              </p>

              <PixelButton

                size="sm"

                variant={showAddForm ? "ghost" : "primary"}

                onClick={() => setShowAddForm((v) => !v)}

              >

                {showAddForm ? "收起" : "+ 新增"}

              </PixelButton>

            </div>



            {showAddForm && (

              <div className="mb-4 p-3 border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg)] space-y-2">

                <PixelInput

                  label="怪物名稱（任務）"

                  value={title}

                  onChange={(e) => setTitle(e.target.value)}

                  placeholder="例如：背 50 個單字"

                />

                <label className="flex flex-col gap-1.5">

                  <span className="text-label text-[var(--pixel-accent)]">綁定目標</span>

                  <select

                    value={goalId}

                    onChange={(e) => setGoalId(e.target.value)}

                    className="pixel-input w-full bg-[var(--pixel-bg)] border-4 border-[var(--pixel-border)] px-4 py-3 text-[var(--pixel-text)] font-body text-lg"

                  >

                    <option value="">無</option>

                    {activeGoals.map((g) => (

                      <option key={g.id} value={g.id}>

                        {g.title}

                      </option>

                    ))}

                  </select>

                </label>

                <div className="grid grid-cols-2 gap-2">

                  <PixelInput

                    label="排程時間"

                    type="time"

                    value={scheduledTime}

                    onChange={(e) => setScheduledTime(e.target.value)}

                  />

                  <PixelInput

                    label="時長（分）"

                    type="number"

                    value={duration}

                    onChange={(e) => setDuration(e.target.value)}

                    min={15}

                    max={120}

                  />

                </div>

                <PixelButton onClick={handleAdd} className="w-full" disabled={!title.trim()}>

                  加入支線任務

                </PixelButton>

              </div>

            )}



            {manualTasks.length > 0 ? (

              <ul className="space-y-2">

                {manualTasks.map((task) => (

                  <TaskRow

                    key={task.id}

                    task={task}

                    goalTitle={task.goalId ? goalTitleById.get(task.goalId) : undefined}

                    variant="side"

                    onToggle={toggleTaskDone}

                    onRemove={removeDayTask}

                  />

                ))}

              </ul>

            ) : (

              <EmptyHint

                icon="✨"

                message="還沒有支線任務"

                hint="點擊「+ 新增」安排今日額外冒險"

              />

            )}

          </PixelCard>

        </div>



        <TimeGrid

          tasks={dayTasks}

          onSchedule={(taskId, time, durationMin) => {

            updateDayTask(taskId, {

              scheduledAt: `${dateStr}T${time}:00`,

              durationMin,

            });

          }}

        />

      </div>

    </div>

  );

}



function DayStatusBar({

  date,

  stageLabel,

  stageNumber,

  doneCount,

  totalCount,

  progress,

  mainQuestCount,

}: {

  date: Date;

  stageLabel: string;

  stageNumber: number;

  doneCount: number;

  totalCount: number;

  progress: number;

  mainQuestCount: number;

}) {

  const weekday = format(date, "EEEE", { locale: zhTW });

  const dateLabel = format(date, "M月 d日", { locale: zhTW });



  return (

    <div className="pixel-card border-4 border-[var(--pixel-accent)] bg-[var(--pixel-surface)] p-4">

      <div className="flex items-start justify-between gap-3 mb-3">

        <div>

          <p className="text-label text-[var(--pixel-accent)] mb-1">今日冒險</p>

          <p className="font-body text-lg text-[var(--pixel-text)]">

            {dateLabel}

            <span className="text-[var(--pixel-text-muted)] text-base ml-2">{weekday}</span>

          </p>

        </div>

        <div className="text-right shrink-0">

          <p className="text-label text-[var(--pixel-mp)]">擊敗進度</p>

          <p className="font-body text-lg text-[var(--pixel-text)]">

            {doneCount}

            <span className="text-[var(--pixel-text-muted)] text-base"> / {totalCount}</span>

          </p>

        </div>

      </div>



      <div className="h-4 border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg)] overflow-hidden mb-3">

        <div

          className="h-full bg-[var(--pixel-success)] transition-all duration-300"

          style={{ width: `${progress}%` }}

        />

      </div>



      <div className="flex flex-wrap items-center gap-2">

        <span className="text-label px-2 py-1 border-2 border-[var(--pixel-accent)] text-[var(--pixel-accent)] bg-[var(--pixel-accent)]/10">

          關卡 {stageNumber}

        </span>

        <span className="font-body text-base text-[var(--pixel-text-muted)]">{stageLabel}</span>

        {mainQuestCount > 0 && (

          <span className="font-body text-base text-[var(--pixel-mp)] ml-auto">

            {mainQuestCount} 條主線

          </span>

        )}

      </div>

    </div>

  );

}



function EmptyHint({ icon, message, hint }: { icon: string; message: string; hint: string }) {

  return (

    <div className="text-center py-6 px-2 border-4 border-dashed border-[var(--pixel-border)] bg-[var(--pixel-bg)]/40">

      <p className="text-2xl mb-2">{icon}</p>

      <p className="font-body text-lg text-[var(--pixel-text-muted)]">{message}</p>

      <p className="font-body text-base text-[var(--pixel-text-muted)]/70 mt-1">{hint}</p>

    </div>

  );

}



function TaskRow({

  task,

  goalTitle,

  variant,

  onToggle,

  onRemove,

}: {

  task: DayTask;

  goalTitle?: string;

  variant: "main" | "side";

  onToggle: (id: string) => void;

  onRemove: (id: string) => void;

}) {

  const isDone = task.status === "done";

  const borderColor =

    variant === "main" ? "border-[var(--pixel-mp)]/60" : "border-[var(--pixel-border)]";

  const accentBg = variant === "main" ? "bg-[var(--pixel-mp)]/5" : "bg-[var(--pixel-bg)]";



  return (

    <li

      className={`flex items-center gap-3 border-4 ${borderColor} ${accentBg} p-3 ${

        isDone ? "opacity-60" : ""

      }`}

    >

      <button

        onClick={() => onToggle(task.id)}

        aria-label={isDone ? "標記為未完成" : "標記為完成"}

        className={`shrink-0 w-11 h-11 flex items-center justify-center border-4 border-[var(--pixel-border)] bg-[var(--pixel-surface)] text-xl transition-transform hover:scale-105 ${

          isDone ? "task-done-sparkle text-[var(--pixel-success)]" : ""

        }`}

      >

        {isDone ? "✓" : "⚔️"}

      </button>



      <div className="flex-1 min-w-0">

        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">

          {goalTitle && (

            <span

              className={`text-label px-1.5 py-0.5 border-2 ${

                variant === "main"

                  ? "border-[var(--pixel-mp)] text-[var(--pixel-mp)]"

                  : "border-[var(--pixel-text-muted)] text-[var(--pixel-text-muted)]"

              }`}

            >

              {goalTitle}

            </span>

          )}

          {variant === "main" && (

            <span className="text-label px-1.5 py-0.5 border-2 border-[var(--pixel-accent)] text-[var(--pixel-accent)]">

              主線

            </span>

          )}

          {task.scheduledAt && (

            <span className="font-body text-base text-[var(--pixel-text-muted)]">

              {new Date(task.scheduledAt).toLocaleTimeString("zh-TW", {

                hour: "2-digit",

                minute: "2-digit",

              })}{" "}

              · {task.durationMin} 分

            </span>

          )}

        </div>

        <p

          className={`font-body text-lg truncate ${

            isDone ? "line-through text-[var(--pixel-text-muted)]" : ""

          }`}

        >

          {task.title}

        </p>

      </div>



      <PixelButton variant="ghost" size="sm" onClick={() => onRemove(task.id)} aria-label="刪除任務">

        ✕

      </PixelButton>

    </li>

  );

}


