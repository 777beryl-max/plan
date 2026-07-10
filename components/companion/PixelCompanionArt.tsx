import type { CompanionMood } from "@/lib/types";
import { SPECIES_SPRITES } from "@/lib/companion/pixel-sprites";
import type { CompanionSpecies } from "@/lib/types";

interface PixelCompanionArtProps {
  species: CompanionSpecies;
  mood?: CompanionMood;
  size?: number;
  className?: string;
}

const MOOD_TINT: Partial<Record<CompanionMood, string>> = {
  sleepy: "opacity-70 saturate-50",
  happy: "brightness-110",
  cheering: "brightness-125",
};

/** 像素風夥伴立繪（SVG，跨平台一致） */
export function PixelCompanionArt({
  species,
  mood = "idle",
  size = 64,
  className = "",
}: PixelCompanionArtProps) {
  const sprite = SPECIES_SPRITES[species];
  const grid = sprite.rows.length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      shapeRendering="crispEdges"
      className={`pixel-sprite ${MOOD_TINT[mood] ?? ""} ${className}`.trim()}
      aria-hidden
    >
      {sprite.rows.map((row, y) =>
        row.split("").map((ch, x) => {
          if (ch === ".") return null;
          const fill = sprite.palette[ch];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        })
      )}
    </svg>
  );
}
