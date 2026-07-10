"use client";

import { useState } from "react";
import { useCompanionStore } from "@/stores/companionStore";
import { COMPANION_SPECIES, type CompanionSpecies } from "@/lib/types";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";
import { CompanionSprite } from "@/components/companion/CompanionSprite";
import { MoodBadge, MOOD_LABELS } from "@/components/companion/MoodBadge";
import { BondBar } from "@/components/companion/BondBar";
import { TreatBadge } from "@/components/companion/TreatBadge";
import { getTreatLabel } from "@/lib/companion/treats";
import { PageBackLink } from "@/components/layout/PageBackLink";

function CompanionPicker({
  initialSpecies,
  initialName,
  onConfirm,
  confirmLabel,
}: {
  initialSpecies?: CompanionSpecies;
  initialName?: string;
  onConfirm: (species: CompanionSpecies, name: string) => Promise<void>;
  confirmLabel: string;
}) {
  const [selectedSpecies, setSelectedSpecies] = useState<CompanionSpecies>(
    initialSpecies ?? "cat"
  );
  const [name, setName] = useState(initialName ?? "");

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {COMPANION_SPECIES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedSpecies(s.id)}
            className={`flex flex-col items-center gap-1 p-3 border-[3px] rounded-2xl transition-all ${
              selectedSpecies === s.id
                ? "border-[var(--pixel-gold-dark)] bg-gradient-to-b from-white to-[var(--pixel-surface-2)] shadow-md scale-105"
                : "border-[var(--pixel-border-soft)] bg-white/80 hover:border-[var(--pixel-accent)]"
            }`}
          >
            <CompanionSprite species={s.id} mood="idle" size="sm" />
            <span className="text-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-4">
        <CompanionSprite species={selectedSpecies} mood="happy" size="lg" />
      </div>

      <PixelInput
        label="夥伴名字"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="幫夥伴取個名字"
      />

      <PixelButton
        onClick={() => void onConfirm(selectedSpecies, name.trim())}
        className="w-full mt-4"
        disabled={!name.trim()}
      >
        {confirmLabel}
      </PixelButton>
    </>
  );
}

export default function CompanionPage() {
  const companion = useCompanionStore((s) => s.companion);
  const bubbleText = useCompanionStore((s) => s.bubbleText);
  const animating = useCompanionStore((s) => s.animating);
  const selectCompanion = useCompanionStore((s) => s.selectCompanion);
  const replaceCompanion = useCompanionStore((s) => s.replaceCompanion);
  const interact = useCompanionStore((s) => s.interact);
  const progress = useCompanionStore((s) => s.progress);
  const feed = useCompanionStore((s) => s.feed);

  const [changing, setChanging] = useState(false);
  const treatCount = progress?.treatCount ?? 0;
  const treatLabel = companion ? getTreatLabel(companion.species) : "";

  const handleSelect = async (species: CompanionSpecies, name: string) => {
    await selectCompanion(species, name);
    setChanging(false);
  };

  const handleReplace = async (species: CompanionSpecies, name: string) => {
    await replaceCompanion(species, name);
    setChanging(false);
  };

  if (!companion) {
    return (
      <div>
        <PageBackLink />
        <PixelCard title="🐾 選擇你的冒險夥伴" accent>
          <p className="font-body text-lg text-[var(--pixel-text-muted)] mb-4">
            選一隻動物夥伴，陪你一起完成日常任務！
          </p>
          <CompanionPicker onConfirm={handleSelect} confirmLabel="確認選擇" />
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageBackLink />
      <PixelCard title={`🐾 ${companion.name}`} accent>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <CompanionSprite
              species={companion.species}
              mood={companion.mood}
              size="lg"
              animating={animating}
            />
            {bubbleText && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap border-4 border-[var(--pixel-border)] bg-white text-[var(--pixel-border)] px-3 py-1 font-body text-lg">
                {bubbleText}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[var(--pixel-border)]" />
              </div>
            )}
          </div>

          <div className="text-center w-full max-w-xs space-y-3">
            <p className="text-display text-[var(--pixel-accent)]">{companion.name}</p>
            <p className="font-body text-lg text-[var(--pixel-text-muted)]">
              {MOOD_LABELS[companion.mood]}
            </p>
            <TreatBadge count={treatCount} species={companion.species} />
            {progress && <BondBar bondXp={progress.bondXp} />}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <PixelButton
              onClick={() => void feed()}
              disabled={treatCount < 1}
              title={treatCount < 1 ? "完成任務可獲得零食" : undefined}
            >
              餵食{treatLabel}
            </PixelButton>
            <PixelButton onClick={() => interact("pet")} variant="secondary">
              摸摸頭
            </PixelButton>
            <PixelButton onClick={() => interact("cheer")} variant="ghost">
              加油！
            </PixelButton>
          </div>
          {treatCount < 1 && (
            <p className="font-body text-sm text-[var(--pixel-text-muted)] text-center">
              完成任務或專注副本可獲得{treatLabel}
            </p>
          )}
        </div>
      </PixelCard>

      <PixelCard title="更換夥伴">
        {changing ? (
          <CompanionPicker
            initialSpecies={companion.species}
            initialName={companion.name}
            onConfirm={handleReplace}
            confirmLabel="確認更換"
          />
        ) : (
          <>
            <p className="font-body text-base text-[var(--pixel-text-muted)] mb-4">
              可以隨時更換夥伴種類與名字，不影響任務進度。
            </p>
            <PixelButton variant="secondary" className="w-full" onClick={() => setChanging(true)}>
              更換夥伴
            </PixelButton>
          </>
        )}
      </PixelCard>

      <PixelCard title="夥伴狀態說明">
        <ul className="font-body text-base text-[var(--pixel-text-muted)] space-y-2">
          {(["sleepy", "idle", "happy", "cheering"] as const).map((mood) => (
            <li key={mood} className="flex items-center gap-2">
              <MoodBadge mood={mood} size={22} />
              <span>
                {MOOD_LABELS[mood]} —{" "}
                {mood === "sleepy"
                  ? "今日尚未完成任務"
                  : mood === "idle"
                    ? "完成了一些任務"
                    : mood === "happy"
                      ? "表現不錯！"
                      : "超棒的一天！"}
              </span>
            </li>
          ))}
        </ul>
      </PixelCard>
    </div>
  );
}
