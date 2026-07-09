"use client";

import { useState } from "react";
import { useGoalStore } from "@/stores/goalStore";
import { MAX_GOAL_POOL, MAX_ACTIVE_GOALS } from "@/lib/rules/goals";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelModal } from "@/components/ui/PixelModal";

export default function GoalsPage() {
  const goals = useGoalStore((s) => s.goals);
  const error = useGoalStore((s) => s.error);
  const poolCount = useGoalStore((s) => s.poolCount);
  const activeCount = useGoalStore((s) => s.activeCount);
  const addGoal = useGoalStore((s) => s.addGoal);
  const toggleActive = useGoalStore((s) => s.toggleActive);
  const removeGoal = useGoalStore((s) => s.removeGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (editingId) {
      await updateGoal(editingId, { title: title.trim(), description: description.trim() });
    } else {
      await addGoal(title.trim(), description.trim());
    }
    setTitle("");
    setDescription("");
    setEditingId(null);
    setModalOpen(false);
  };

  const openEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    setEditingId(id);
    setTitle(goal.title);
    setDescription(goal.description);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setModalOpen(true);
  };

  const activeGoals = goals.filter((g) => g.isActive);
  const poolGoals = goals.filter((g) => !g.isActive);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <PixelCard title="目標池">
          <p className="font-body text-2xl text-[var(--pixel-accent)]">
            {poolCount()}/{MAX_GOAL_POOL}
          </p>
        </PixelCard>
        <PixelCard title="進行中">
          <p className="font-body text-2xl text-[var(--pixel-mp)]">
            {activeCount()}/{MAX_ACTIVE_GOALS}
          </p>
        </PixelCard>
      </div>

      {error && (
        <div className="border-4 border-[var(--pixel-hp)] bg-[var(--pixel-hp)]/20 p-3 font-body text-lg text-[var(--pixel-hp)]">
          {error}
        </div>
      )}

      <PixelButton onClick={openAdd} disabled={poolCount() >= MAX_GOAL_POOL} className="w-full">
        + 新增人生目標
      </PixelButton>

      {activeGoals.length > 0 && (
        <PixelCard title="⚔️ 進行中主線" accent>
          <ul className="space-y-3">
            {activeGoals.map((goal, i) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                level={i + 1}
                onToggle={() => toggleActive(goal.id)}
                onEdit={() => openEdit(goal.id)}
                onRemove={() => removeGoal(goal.id)}
              />
            ))}
          </ul>
        </PixelCard>
      )}

      <PixelCard title="📦 目標池（待啟動）">
        {poolGoals.length === 0 ? (
          <p className="font-body text-lg text-[var(--pixel-text-muted)]">目標池是空的</p>
        ) : (
          <ul className="space-y-3">
            {poolGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onToggle={() => toggleActive(goal.id)}
                onEdit={() => openEdit(goal.id)}
                onRemove={() => removeGoal(goal.id)}
              />
            ))}
          </ul>
        )}
      </PixelCard>

      <PixelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "編輯目標" : "新增目標"}
      >
        <div className="space-y-3">
          <PixelInput
            label="目標名稱"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：學會日文"
          />
          <PixelInput
            label="描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="簡短描述這個目標"
          />
          <PixelButton onClick={handleSubmit} className="w-full">
            {editingId ? "儲存" : "加入目標池"}
          </PixelButton>
        </div>
      </PixelModal>
    </div>
  );
}

function GoalItem({
  goal,
  level,
  onToggle,
  onEdit,
  onRemove,
}: {
  goal: { id: string; title: string; description: string; isActive: boolean };
  level?: number;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="border-4 border-[var(--pixel-border)] p-3 bg-[var(--pixel-bg)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {level && (
            <span className="text-label text-[var(--pixel-mp)] mr-2">
              Lv.{level}
            </span>
          )}
          <span className="font-body text-lg font-bold">{goal.title}</span>
          {goal.description && (
            <p className="font-body text-base text-[var(--pixel-text-muted)] mt-1">
              {goal.description}
            </p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <PixelButton variant="ghost" size="sm" onClick={onEdit}>
            ✎
          </PixelButton>
          <PixelButton
            variant={goal.isActive ? "danger" : "secondary"}
            size="sm"
            onClick={onToggle}
          >
            {goal.isActive ? "停用" : "啟動"}
          </PixelButton>
          <PixelButton variant="ghost" size="sm" onClick={onRemove}>
            ✕
          </PixelButton>
        </div>
      </div>
    </li>
  );
}
