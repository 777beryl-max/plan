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

/** 與冒險者頭像框同風格的夥伴展示 */
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
      className={`adventure-companion-frame relative flex items-center justify-center ${frame.box} ${
        animating ? "companion-bounce" : mood !== "sleepy" ? "companion-idle" : ""
      }`}
      style={
        info?.color
          ? { background: `linear-gradient(180deg, #fffef9 0%, ${info.color}33 100%)` }
          : undefined
      }
    >
      <PixelCompanionArt species={species} mood={mood} size={frame.art} className="max-w-[88%] max-h-[88%]" />
      <span className="absolute -top-1 -right-1 adventure-mood-badge">
        <MoodBadge mood={mood} size={size === "lg" ? 22 : 18} />
      </span>
    </div>
  );
}
