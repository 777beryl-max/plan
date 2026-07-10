/** html2canvas-safe hex colors (no Tailwind oklab utilities on poster export tree) */
export const POSTER_COLORS = {
  goldDark: "#e8b923",
  gold: "#ffd93d",
  accent: "#ff9f43",
  border: "#6b4f3a",
  borderSoft: "#c4a882",
  text: "#4a3728",
  textMuted: "#7a6552",
  mp: "#4ecdc4",
  success: "#6bcb77",
  surface: "#fff9f0",
  surface2: "#fff0d4",
  skyMid: "#9edcff",
  white: "#ffffff",
  panelBg: "rgba(255, 255, 255, 0.78)",
  chartBg: "rgba(255, 255, 255, 0.65)",
  goalsBg: "rgba(255, 255, 255, 0.6)",
  goalItemBg: "rgba(255, 255, 255, 0.88)",
  posterGradient: "linear-gradient(160deg, #fffef8 0%, #fff4d6 45%, #ffe8b8 100%)",
  badgeLeader: "linear-gradient(180deg, #ffe566 0%, #ff9f43 100%)",
  badgePartner: "linear-gradient(180deg, #b8f0eb 0%, #4ecdc4 100%)",
  medalGradient: "linear-gradient(180deg, #ffffff 0%, #fff6c8 100%)",
  stageBadge: "linear-gradient(180deg, #ffe566 0%, #ffb347 100%)",
  frameGradient: "linear-gradient(180deg, #fffef9 0%, #fff0d4 55%, #9edcff 100%)",
  statAccent: "linear-gradient(180deg, #fff6c8 0%, #ffe566 100%)",
  statMp: "linear-gradient(180deg, #e8faf8 0%, #b8f0eb 100%)",
  statSuccess: "linear-gradient(180deg, #e8f9ea 0%, #c8f0cc 100%)",
} as const;

export const POSTER_CHARACTER_SIZE = 96;

export const POSTER_CHARACTER_FRAME_BASE = {
  width: POSTER_CHARACTER_SIZE,
  height: POSTER_CHARACTER_SIZE,
  margin: "0 auto",
  borderRadius: 20,
  border: `3px solid ${POSTER_COLORS.border}`,
  boxShadow: `3px 3px 0 ${POSTER_COLORS.border}`,
  overflow: "hidden" as const,
  boxSizing: "border-box" as const,
  backgroundSize: "cover" as const,
  backgroundPosition: "center center" as const,
  backgroundRepeat: "no-repeat" as const,
};

export function posterCharacterFrameStyle(src?: string) {
  return {
    ...POSTER_CHARACTER_FRAME_BASE,
    backgroundImage: src ? `url("${src}")` : POSTER_COLORS.frameGradient,
  };
}
