"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/stores/appStore";
import { useCompanionStore } from "@/stores/companionStore";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";
import { AdventureAvatar } from "@/components/ui/AdventureAvatar";
import { CompanionSprite } from "@/components/companion/CompanionSprite";
import { getRemainingAvatarChanges } from "@/lib/avatar/limits";

export default function SettingsPage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetGoalsAndPlans = useAppStore((s) => s.resetGoalsAndPlans);
  const companion = useCompanionStore((s) => s.companion);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (profile?.displayName) setDisplayName(profile.displayName);
  }, [profile?.displayName]);

  if (!profile) {
    return (
      <PixelCard title="設定">
        <p className="font-body text-lg text-[var(--pixel-text-muted)]">載入中…</p>
      </PixelCard>
    );
  }

  const remainingAvatar = getRemainingAvatarChanges(profile);

  const saveName = async () => {
    const name = displayName.trim();
    if (!name) return;
    setSaving(true);
    try {
      await updateProfile({ displayName: name });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetGoalsAndPlans();
      setResetOpen(false);
      router.push("/goals");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PixelCard title="⚙️ 冒險者設定" accent>
        <div className="space-y-5">
          <section>
            <p className="text-label text-[var(--pixel-text-muted)] mb-2">暱稱</p>
            <PixelInput
              label="冒險者名稱"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="你的名字"
            />
            <PixelButton
              className="w-full mt-3"
              onClick={saveName}
              disabled={saving || !displayName.trim() || displayName.trim() === profile.displayName}
            >
              {saving ? "儲存中…" : "儲存暱稱"}
            </PixelButton>
          </section>

          <section className="border-t-[3px] border-dashed border-[var(--pixel-border-soft)] pt-4">
            <p className="text-label text-[var(--pixel-text-muted)] mb-3">頭像</p>
            <div className="flex items-center gap-4">
              {profile.aiCharacterUrl ? (
                <AdventureAvatar src={profile.aiCharacterUrl} alt="頭像" size="sm" />
              ) : (
                <div className="adventure-placeholder w-16 h-16">
                  <span className="text-xl opacity-50">🧙</span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-body text-base text-[var(--pixel-text-muted)]">
                  {profile.aiCharacterUrl ? "已覺醒" : "尚未生成"}
                </p>
                <p className="font-body text-sm text-[var(--pixel-accent)] mt-1">
                  還可換頭像 {remainingAvatar} 次
                </p>
                <p className="font-body text-sm text-[var(--pixel-text-muted)] mt-1">
                  在基地點擊頭像即可更換
                </p>
              </div>
            </div>
          </section>

          <section className="border-t-[3px] border-dashed border-[var(--pixel-border-soft)] pt-4">
            <p className="text-label text-[var(--pixel-text-muted)] mb-3">夥伴</p>
            <div className="flex items-center gap-4">
              {companion ? (
                <CompanionSprite species={companion.species} mood={companion.mood} size="sm" />
              ) : (
                <div className="adventure-placeholder w-16 h-16">
                  <span className="text-xl opacity-40">🐾</span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-body text-base text-[var(--pixel-accent)]">
                  {companion?.name ?? "尚未結伴"}
                </p>
                <Link href="/companion" className="inline-block mt-2">
                  <PixelButton size="sm" variant="secondary">
                    {companion ? "更換夥伴" : "選擇夥伴"}
                  </PixelButton>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </PixelCard>

      <PixelCard title="重置目標與計畫">
        <p className="font-body text-base text-[var(--pixel-text-muted)] mb-4 leading-relaxed">
          僅清除目標與計畫，方便重新規劃。暱稱、頭像、夥伴、專注紀錄、冒險經驗值與週冒險戰報都會保留。
        </p>
        <PixelButton variant="ghost" className="w-full" onClick={() => setResetOpen(true)}>
          重置目標與計畫
        </PixelButton>
      </PixelCard>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm pixel-card border-[3px] border-[var(--pixel-hp)] bg-[var(--pixel-surface)] p-5 shadow-xl">
            <h2 className="text-display text-[var(--pixel-hp)] mb-3">⚠️ 確定重置？</h2>
            <p className="font-body text-base text-[var(--pixel-text-muted)] leading-relaxed mb-5">
              這會清除所有目標與月／週／日計畫。暱稱、頭像、夥伴、專注紀錄、冒險經驗值與週冒險戰報會保留。此操作無法復原。
            </p>
            <div className="flex gap-2">
              <PixelButton
                variant="ghost"
                className="flex-1"
                onClick={() => setResetOpen(false)}
                disabled={resetting}
              >
                取消
              </PixelButton>
              <PixelButton
                className="flex-1 !border-[var(--pixel-hp)]"
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? "重置中…" : "確定重置"}
              </PixelButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
