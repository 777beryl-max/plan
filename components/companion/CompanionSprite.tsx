"use client";

import type { CompanionMood, CompanionSpecies } from "@/lib/types";
import { COMPANION_SPECIES } from "@/lib/types";
import { PixelCompanionArt } from "@/components/companion/PixelCompanionArt";
import { MoodBadge } from "@/components/companion/MoodBadge";

interface CompanionSpriteProps {
  species: CompanionSpecies;
  mood: CompanionMood;
  size?: "sm" | "md" | "lg";
  animating?: boolean;
}

const FRAME_SIZES = {
  sm: { box: "w-16 h-16", art: 40 },
  md: { box: "w-24 h-24", art: 64 },
  lg: { box: "w-32 h-32", art: 88 },
};

export function CompanionSprite({
  species,
  mood,
  size = "md",
  animating,
}: CompanionSpriteProps) {
  const info = COMPANION_SPECIES.find((s) => s.id === species);
  const frame = FRAME_SIZES[size];

  return (
    <div
      className={`relative flex items-center justify-center border-[3px] border-[var(--pixel-border)] rounded-2xl bg-gradient-to-b from-white to-[var(--pixel-surface-2)] ${frame.box} ${
        animating ? "companion-bounce" : mood !== "sleepy" ? "companion-idle" : ""
      }`}
      style={{ boxShadow: "3px 3px 0 var(--pixel-border-soft)" }}
    >
      <PixelCompanionArt species={species} mood={mood} size={frame.art} />
      <span className="absolute -top-1 -right-1 border-2 border-[var(--pixel-border)] rounded-lg bg-white p-0.5">
        <MoodBadge mood={mood} size={size === "lg" ? 24 : 18} />
      </span>
    </div>
  );
}
