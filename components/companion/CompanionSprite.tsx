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
  sm: { box: "w-16 h-16", badge: 22 },
  md: { box: "w-24 h-24", badge: 28 },
  lg: { box: "w-32 h-32", badge: 32 },
};

const BADGE_OFFSET = {
  sm: "-top-2.5 -right-1",
  md: "-top-3 -right-1",
  lg: "-top-3.5 -right-1",
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
    <div className="relative shrink-0">
      <div
        className={`adventure-companion-frame relative overflow-hidden ${frame.box} ${
          animating ? "companion-bounce" : mood !== "sleepy" ? "companion-idle" : ""
        }`}
        style={
          info?.color
            ? { background: `linear-gradient(180deg, ${info.color}44 0%, ${info.color}88 100%)` }
            : undefined
        }
      >
        <PixelCompanionArt
          species={species}
          mood={mood}
          className="absolute inset-0 w-full h-full companion-art-fill"
        />
      </div>
      <span
        className={`absolute ${BADGE_OFFSET[size]} adventure-mood-badge z-10`}
        aria-hidden
      >
        <MoodBadge mood={mood} size={frame.badge} />
      </span>
    </div>
  );
}
