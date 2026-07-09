"use client";

import type { CompanionMood, CompanionSpecies } from "@/lib/types";
import { COMPANION_SPECIES } from "@/lib/types";

const MOOD_EMOJI: Record<CompanionMood, string> = {
  idle: "😐",
  happy: "😊",
  cheering: "🎉",
  sleepy: "😴",
};

interface CompanionSpriteProps {
  species: CompanionSpecies;
  mood: CompanionMood;
  size?: "sm" | "md" | "lg";
  animating?: boolean;
}

export function CompanionSprite({
  species,
  mood,
  size = "md",
  animating,
}: CompanionSpriteProps) {
  const info = COMPANION_SPECIES.find((s) => s.id === species);
  const emoji = info?.emoji ?? "🐾";
  const moodEmoji = MOOD_EMOJI[mood];

  const sizeClasses = {
    sm: "text-4xl w-16 h-16",
    md: "text-6xl w-24 h-24",
    lg: "text-8xl w-32 h-32",
  };

  return (
    <div
      className={`relative flex items-center justify-center border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg)] ${sizeClasses[size]} ${
        animating ? "companion-bounce" : mood !== "sleepy" ? "companion-idle" : ""
      }`}
      style={{ backgroundColor: info?.color ? `${info.color}22` : undefined }}
    >
      <span role="img" aria-label={info?.label}>
        {emoji}
      </span>
      <span className="absolute -top-2 -right-2 text-lg">{moodEmoji}</span>
    </div>
  );
}
