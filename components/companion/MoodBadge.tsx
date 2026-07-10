import type { CompanionMood } from "@/lib/types";

const MOOD_PIXELS: Record<
  CompanionMood,
  { rows: string[]; palette: Record<string, string> }
> = {
  idle: {
    palette: { K: "#1a1a2e", W: "#ffffff" },
    rows: ["KK", "WW"],
  },
  happy: {
    palette: { K: "#1a1a2e" },
    rows: ["K.K", ".K."],
  },
  cheering: {
    palette: { Y: "#f7d51d", K: "#1a1a2e" },
    rows: [".Y.", "YKY", ".Y."],
  },
  sleepy: {
    palette: { K: "#9b8ec4", W: "#ffffff" },
    rows: ["KKK", "WWW", "KKK"],
  },
};

interface MoodBadgeProps {
  mood: CompanionMood;
  size?: number;
}

export function MoodBadge({ mood, size = 20 }: MoodBadgeProps) {
  const sprite = MOOD_PIXELS[mood];
  const grid = sprite.rows.length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      shapeRendering="crispEdges"
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

export const MOOD_LABELS: Record<CompanionMood, string> = {
  sleepy: "想睡覺",
  idle: "普通",
  happy: "開心",
  cheering: "超棒",
};
