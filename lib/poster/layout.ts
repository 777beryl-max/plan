import { POSTER_COLORS, POSTER_CHARACTER_SIZE } from "./colors";

export const POSTER_TEXT_CENTER = {
  textAlign: "center" as const,
  margin: 0,
};

export const POSTER_MEDAL_SIZE = 88;

export function posterWeekBadgeStyle() {
  return {
    display: "inline-block" as const,
    padding: "6px 18px",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: "14px",
    color: POSTER_COLORS.border,
    whiteSpace: "nowrap" as const,
    textAlign: "center" as const,
    borderRadius: 999,
    border: `3px solid ${POSTER_COLORS.border}`,
    background: POSTER_COLORS.stageBadge,
    boxShadow: `2px 2px 0 ${POSTER_COLORS.border}`,
    boxSizing: "border-box" as const,
  };
}

export function posterRoleBadgeStyle(tone: "leader" | "partner") {
  return {
    display: "inline-block" as const,
    minWidth: 56,
    padding: "4px 14px",
    margin: "0 auto 8px",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: "11px",
    color: POSTER_COLORS.border,
    whiteSpace: "nowrap" as const,
    textAlign: "center" as const,
    borderRadius: 999,
    border: `2px solid ${tone === "leader" ? POSTER_COLORS.goldDark : POSTER_COLORS.mp}`,
    background: tone === "leader" ? POSTER_COLORS.badgeLeader : POSTER_COLORS.badgePartner,
    boxSizing: "border-box" as const,
  };
}

export function posterNameStyle() {
  return {
    ...POSTER_TEXT_CENTER,
    width: POSTER_CHARACTER_SIZE,
    marginTop: 8,
    paddingBottom: 4,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: "22px",
    color: POSTER_COLORS.text,
    whiteSpace: "nowrap" as const,
  };
}

export const POSTER_SQUAD_STYLE = {
  display: "flex" as const,
  justifyContent: "center" as const,
  alignItems: "flex-end" as const,
  gap: 12,
  margin: "0 auto",
  maxWidth: "100%",
};

export function posterSquadColumnStyle(width: number) {
  return {
    width,
    minWidth: width,
    flexShrink: 0,
    textAlign: "center" as const,
  };
}

export const POSTER_MEDAL_RATE_STYLE = {
  fontSize: 22,
  fontWeight: 700,
  lineHeight: "24px",
  color: POSTER_COLORS.text,
  margin: 0,
  padding: 0,
  textAlign: "center" as const,
};

export const POSTER_MEDAL_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 700,
  lineHeight: "14px",
  color: POSTER_COLORS.textMuted,
  margin: "3px 0 0",
  padding: 0,
  textAlign: "center" as const,
};

export const POSTER_MEDAL_OUTER_STYLE = {
  width: POSTER_MEDAL_SIZE,
  height: POSTER_MEDAL_SIZE,
  borderRadius: "50%",
  border: `4px solid ${POSTER_COLORS.goldDark}`,
  background: POSTER_COLORS.medalGradient,
  boxShadow: `3px 4px 0 ${POSTER_COLORS.border}`,
  display: "flex" as const,
  flexDirection: "column" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  margin: "0 auto",
  boxSizing: "border-box" as const,
};

export function posterGoalRowStyle() {
  return {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 8,
    width: "100%",
  };
}

export function posterGoalTitleStyle() {
  return {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px",
    color: POSTER_COLORS.text,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  };
}

export function posterGoalScoreStyle() {
  return {
    flexShrink: 0,
    minWidth: 52,
    textAlign: "right" as const,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: "20px",
    whiteSpace: "nowrap" as const,
    color: POSTER_COLORS.accent,
  };
}

export function posterStatPillContentStyle() {
  return {
    ...POSTER_TEXT_CENTER,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "24px",
    fontVariantNumeric: "tabular-nums" as const,
  };
}

export function posterStatPillLabelStyle() {
  return {
    ...POSTER_TEXT_CENTER,
    marginTop: 4,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "18px",
    color: POSTER_COLORS.textMuted,
  };
}
