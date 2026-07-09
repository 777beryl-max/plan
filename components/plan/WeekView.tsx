"use client";

import { useState } from "react";
import { useActiveGoals } from "@/hooks/useActiveGoals";
import { usePlanStore } from "@/stores/planStore";
import { emptyWeekTargets, WEEK_TARGET_COUNT, WEEK_STAGE_LABELS } from "@/lib/rules/plan";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";

export function WeekView() {
  const activeGoals = useActiveGoals();
  const monthPlans = usePlanStore((s) => s.monthPlans);
  const weekPlans = usePlanStore((s) => s.weekPlans);
  const saveWeekPlanForGoal = usePlanStore((s) => s.saveWeekPlanForGoal);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [targets, setTargets] = useState<string[]>(emptyWeekTargets());
  const [saving, setSaving] = useState(false);

  if (activeGoals.length === 0) {
    return (
      <PixelCard>
        <p className="font-body text-lg text-[var(--pixel-text-muted)]">
          請先啟動至少一個目標
        </p>
      </PixelCard>
    );
  }

  const startEdit = (goalId: string) => {
    const plan = weekPlans.find((p) => p.goalId === goalId);
    setEditingGoalId(goalId);
    const slots = emptyWeekTargets();
    plan?.targets.forEach((t, i) => {
      if (i < WEEK_TARGET_COUNT) slots[i] = t;
    });
    setTargets(slots);
  };

  const save = async () => {
    if (!editingGoalId) return;
    setSaving(true);
    try {
      await saveWeekPlanForGoal(editingGoalId, targets);
      setEditingGoalId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-body text-base text-[var(--pixel-text-muted)]">
        周計畫 = 4 個關卡（第1週～第4週各一關，本週一～週日顯示同一關卡）
      </p>
      {activeGoals.map((goal) => {
        const plan = weekPlans.find((p) => p.goalId === goal.id);
        const monthPlan = monthPlans.find((p) => p.goalId === goal.id);
        const isEditing = editingGoalId === goal.id;

        return (
          <PixelCard key={goal.id} title={`🗡️ ${goal.title}`}>
            {monthPlan?.targets[0] && (
              <p className="font-body text-base text-[var(--pixel-text-muted)] mb-2 border-l-4 border-[var(--pixel-accent)] pl-2">
                月里程碑：{monthPlan.targets[0]}
              </p>
            )}
            {isEditing ? (
              <div className="space-y-2">
                {targets.map((t, i) => (
                  <PixelInput
                    key={i}
                    label={`${WEEK_STAGE_LABELS[i]} 關卡 ${i + 1}`}
                    value={t}
                    onChange={(e) => {
                      const next = [...targets];
                      next[i] = e.target.value;
                      setTargets(next);
                    }}
                    placeholder={`${WEEK_STAGE_LABELS[i]}要打敗的怪物`}
                  />
                ))}
                <div className="flex gap-2">
                  <PixelButton onClick={save} size="sm" disabled={saving}>
                    {saving ? "同步中..." : "確認並同步日計畫"}
                  </PixelButton>
                  <PixelButton variant="ghost" size="sm" onClick={() => setEditingGoalId(null)}>
                    取消
                  </PixelButton>
                </div>
              </div>
            ) : (
              <>
                {plan && plan.targets.some((t) => t.trim()) ? (
                  <ul className="space-y-1">
                    {plan.targets.map((t, i) =>
                      t.trim() ? (
                        <li key={i} className="font-body text-lg flex gap-2">
                          <span className="text-[var(--pixel-mp)] shrink-0">
                            {WEEK_STAGE_LABELS[i]}
                          </span>
                          <span>{t}</span>
                        </li>
                      ) : null
                    )}
                  </ul>
                ) : (
                  <p className="font-body text-lg text-[var(--pixel-text-muted)]">尚未設定周目標</p>
                )}
                <PixelButton size="sm" className="mt-2" onClick={() => startEdit(goal.id)}>
                  {plan?.targets.some((t) => t.trim()) ? "編輯" : "設定"}周目標
                </PixelButton>
              </>
            )}
          </PixelCard>
        );
      })}
    </div>
  );
}
