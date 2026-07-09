"use client";

import { useState } from "react";
import { useActiveGoals } from "@/hooks/useActiveGoals";
import { usePlanStore } from "@/stores/planStore";
import { emptyMonthTargets } from "@/lib/rules/plan";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";

export function MonthView() {
  const activeGoals = useActiveGoals();
  const monthPlans = usePlanStore((s) => s.monthPlans);
  const saveMonthPlanForGoal = usePlanStore((s) => s.saveMonthPlanForGoal);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [milestone, setMilestone] = useState("");
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
    const plan = monthPlans.find((p) => p.goalId === goalId);
    setEditingGoalId(goalId);
    setMilestone(plan?.targets[0] ?? "");
  };

  const save = async () => {
    if (!editingGoalId || !milestone.trim()) return;
    setSaving(true);
    try {
      await saveMonthPlanForGoal(editingGoalId, [milestone]);
      setEditingGoalId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-body text-base text-[var(--pixel-text-muted)]">
        月計畫 = 章節里程碑（確認後自動連動本週周計畫與日計畫）
      </p>
      {activeGoals.map((goal) => {
        const plan = monthPlans.find((p) => p.goalId === goal.id);
        const isEditing = editingGoalId === goal.id;

        return (
          <PixelCard key={goal.id} title={`📖 ${goal.title}`}>
            {isEditing ? (
              <div className="space-y-2">
                <PixelInput
                  label="本月里程碑"
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  placeholder="本月要達成的里程碑"
                />
                <div className="flex gap-2">
                  <PixelButton onClick={save} size="sm" disabled={!milestone.trim() || saving}>
                    {saving ? "連動中..." : "確認並連動周計畫"}
                  </PixelButton>
                  <PixelButton variant="ghost" size="sm" onClick={() => setEditingGoalId(null)}>
                    取消
                  </PixelButton>
                </div>
              </div>
            ) : (
              <>
                {plan && plan.targets[0] ? (
                  <p className="font-body text-lg flex gap-2">
                    <span className="text-[var(--pixel-accent)]">▸</span>
                    {plan.targets[0]}
                  </p>
                ) : (
                  <p className="font-body text-lg text-[var(--pixel-text-muted)]">尚未設定里程碑</p>
                )}
                <PixelButton size="sm" className="mt-2" onClick={() => startEdit(goal.id)}>
                  {plan?.targets[0] ? "編輯" : "設定"}里程碑
                </PixelButton>
              </>
            )}
          </PixelCard>
        );
      })}
    </div>
  );
}
