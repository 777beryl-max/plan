import type { CompanionMood } from "@/lib/types";

const MOOD_PIXELS: Record<
  CompanionMood,
  { rows: string[]; palette: Record<string, string> }
> = {
  idle: {
    palette: { K: "#4a3728", W: "#ffffff", o: "#ffeaa7" },
    rows: [".o.", "KWK", ".K."],
  },
  happy: {
    palette: { K: "#4a3728", R: "#ffb3c6" },
    rows: ["R.R", "K.K", ".R."],
  },
  cheering: {
    palette: { Y: "#ffe066", K: "#4a3728", R: "#ffb3c6" },
    rows: ["Y.Y", "RKR", ".Y."],
  },
  sleepy: {
    palette: { K: "#9b8ec4", W: "#e8e0ff" },
    rows: ["z.z", "KWK", "z.z"],
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
