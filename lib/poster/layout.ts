import { POSTER_COLORS, POSTER_CHARACTER_SIZE } from "./colors";

/** html2canvas renders table-cell centering more reliably than flexbox. */
export const POSTER_TEXT_CENTER = {
  textAlign: "center" as const,
  margin: 0,
};

export const POSTER_MEDAL_SIZE = 88;

export function posterPillCellStyle(
  fontSize: number,
  color: string,
  padding = "4px 14px"
) {
  return {
    display: "table-cell" as const,
    verticalAlign: "middle" as const,
    textAlign: "center" as const,
    padding,
    fontSize,
    fontWeight: 700,
    lineHeight: `${fontSize + 6}px`,
    color,
    whiteSpace: "nowrap" as const,
  };
}

export function posterWeekBadgeOuterStyle() {
  return {
    display: "table" as const,
    margin: "0 auto",
    tableLayout: "fixed" as const,
    width: 120,
    borderRadius: 999,
    border: `3px solid ${POSTER_COLORS.border}`,
    background: POSTER_COLORS.stageBadge,
    boxShadow: `2px 2px 0 ${POSTER_COLORS.border}`,
  };
}

export function posterRoleBadgeOuterStyle(tone: "leader" | "partner") {
  return {
    display: "table" as const,
    width: POSTER_CHARACTER_SIZE,
    margin: "0 auto 8px",
    tableLayout: "fixed" as const,
    borderRadius: 999,
    border: `2px solid ${tone === "leader" ? POSTER_COLORS.goldDark : POSTER_COLORS.mp}`,
    background: tone === "leader" ? POSTER_COLORS.badgeLeader : POSTER_COLORS.badgePartner,
  };
}

/** @deprecated Use PosterPill + posterRoleBadgeOuterStyle */
export function posterBadgeStyle(tone: "leader" | "partner") {
  return {
    display: "block" as const,
    width: "fit-content" as const,
    margin: "0 auto 8px",
    textAlign: "center" as const,
    fontSize: 10,
    fontWeight: 700,
    lineHeight: "16px",
    padding: "2px 10px",
    borderRadius: 999,
    border: `2px solid ${tone === "leader" ? POSTER_COLORS.goldDark : POSTER_COLORS.mp}`,
    background: tone === "leader" ? POSTER_COLORS.badgeLeader : POSTER_COLORS.badgePartner,
    color: POSTER_COLORS.border,
    minWidth: 40,
  };
}

export function posterNameStyle() {
  return {
    ...POSTER_TEXT_CENTER,
    width: POSTER_CHARACTER_SIZE,
    marginTop: 8,
    paddingBottom: 4,
    minHeight: 24,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: "22px",
    color: POSTER_COLORS.text,
    overflow: "visible" as const,
    whiteSpace: "nowrap" as const,
  };
}

export function posterSquadColumnStyle(width: number) {
  return {
    width,
    minWidth: width,
    maxWidth: width,
    textAlign: "center" as const,
    flexShrink: 0,
  };
}

export const POSTER_SQUAD_FLEX_STYLE = {
  display: "flex" as const,
  justifyContent: "center" as const,
  alignItems: "flex-end" as const,
  flexWrap: "nowrap" as const,
  gap: 12,
  margin: "0 auto",
  maxWidth: "100%",
  overflow: "visible" as const,
};

export const POSTER_MEDAL_TEXT_WRAP_STYLE = {
  width: "100%",
  textAlign: "center" as const,
};

export const POSTER_MEDAL_RATE_STYLE = {
  ...POSTER_TEXT_CENTER,
  fontSize: 24,
  fontWeight: 800,
  lineHeight: "28px",
  color: POSTER_COLORS.accent,
};

export const POSTER_MEDAL_LABEL_STYLE = {
  ...POSTER_TEXT_CENTER,
  marginTop: 2,
  fontSize: 10,
  fontWeight: 500,
  lineHeight: "12px",
  color: POSTER_COLORS.textMuted,
};

export const POSTER_MEDAL_OUTER_STYLE = {
  width: POSTER_MEDAL_SIZE,
  height: POSTER_MEDAL_SIZE,
  borderRadius: "50%",
  border: `4px solid ${POSTER_COLORS.goldDark}`,
  background: POSTER_COLORS.medalGradient,
  boxShadow: `3px 4px 0 ${POSTER_COLORS.border}`,
  display: "table" as const,
  margin: "0 auto",
};

export const POSTER_MEDAL_INNER_STYLE = {
  display: "table-cell" as const,
  verticalAlign: "middle" as const,
  textAlign: "center" as const,
};

export function posterStatPillContentStyle() {
  return {
    ...POSTER_TEXT_CENTER,
    fontSize: 20,
    fontWeight: 800,
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
