import type { CompanionMood, CompanionSpecies } from "@/lib/types";
import {
  COMPANION_IMAGE_LABEL,
  COMPANION_IMAGE_SRC,
} from "@/lib/companion/companion-images";

interface PixelCompanionArtProps {
  species: CompanionSpecies;
  mood?: CompanionMood;
  size?: number;
  className?: string;
}

const MOOD_TINT: Partial<Record<CompanionMood, string>> = {
  sleepy: "opacity-70 saturate-75",
  happy: "brightness-105 saturate-110",
  cheering: "brightness-110 saturate-115 scale-105",
};

/** 夥伴立繪（使用 public/images 插畫） */
export function PixelCompanionArt({
  species,
  mood = "idle",
  size = 64,
  className = "",
}: PixelCompanionArtProps) {
  return (
    <img
      src={COMPANION_IMAGE_SRC[species]}
      alt={COMPANION_IMAGE_LABEL[species]}
      width={size}
      height={size}
      className={`companion-art-img ${MOOD_TINT[mood] ?? ""} ${className}`.trim()}
      draggable={false}
    />
  );
}
