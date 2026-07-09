"use client";

import { useState } from "react";
import Link from "next/link";
import { useCompanionStore } from "@/stores/companionStore";
import { COMPANION_SPECIES, type CompanionSpecies } from "@/lib/types";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";
import { CompanionSprite } from "@/components/companion/CompanionSprite";

export default function CompanionPage() {
  const companion = useCompanionStore((s) => s.companion);
  const bubbleText = useCompanionStore((s) => s.bubbleText);
  const animating = useCompanionStore((s) => s.animating);
  const selectCompanion = useCompanionStore((s) => s.selectCompanion);
  const interact = useCompanionStore((s) => s.interact);

  const [selectedSpecies, setSelectedSpecies] = useState<CompanionSpecies>("cat");
  const [name, setName] = useState("");

  const handleSelect = async () => {
    if (!name.trim()) return;
    await selectCompanion(selectedSpecies, name.trim());
  };

  if (!companion) {
    return (
      <div className="space-y-4">
        <Link href="/">
          <PixelButton variant="ghost" size="sm">
            ← 返回基地
          </PixelButton>
        </Link>
        <PixelCard title="🐾 選擇你的冒險夥伴" accent>
          <p className="font-body text-lg text-[var(--pixel-text-muted)] mb-4">
            選一隻動物夥伴，陪你一起完成日常任務！
          </p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {COMPANION_SPECIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSpecies(s.id)}
                className={`flex flex-col items-center gap-1 p-3 border-4 transition-colors ${
                  selectedSpecies === s.id
                    ? "border-[var(--pixel-accent)] bg-[var(--pixel-accent)]/10"
                    : "border-[var(--pixel-border)] bg-[var(--pixel-bg)]"
                }`}
              >
                <span className="text-3xl">{s.emoji}</span>
                <span className="text-label">{s.label}</span>
              </button>
            ))}
          </div>

          <CompanionSprite species={selectedSpecies} mood="happy" size="lg" />

          <div className="mt-4">
            <PixelInput
              label="夥伴名字"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="幫夥伴取個名字"
            />
          </div>

          <PixelButton onClick={handleSelect} className="w-full mt-4" disabled={!name.trim()}>
            確認選擇
          </PixelButton>
        </PixelCard>
      </div>
    );
  }

  const speciesInfo = COMPANION_SPECIES.find((s) => s.id === companion.species);

  return (
    <div className="space-y-4">
      <Link href="/">
        <PixelButton variant="ghost" size="sm">
          ← 返回基地
        </PixelButton>
      </Link>
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

          <div className="text-center">
          <p className="text-display text-[var(--pixel-accent)]">{companion.name}</p>
            <p className="font-body text-lg text-[var(--pixel-text-muted)]">
              {speciesInfo?.label} · 心情：{companion.mood}
            </p>
          </div>

          <div className="flex gap-3">
            <PixelButton onClick={() => interact("pet")} variant="secondary">
              摸摸頭
            </PixelButton>
            <PixelButton onClick={() => interact("cheer")}>
              加油！
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      <PixelCard title="夥伴狀態說明">
        <ul className="font-body text-base text-[var(--pixel-text-muted)] space-y-1">
          <li>😴 sleepy — 今日尚未完成任務</li>
          <li>😐 idle — 完成了一些任務</li>
          <li>😊 happy — 表現不錯！</li>
          <li>🎉 cheering — 超棒的一天！</li>
        </ul>
      </PixelCard>
    </div>
  );
}
