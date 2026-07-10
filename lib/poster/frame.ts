import {
  POSTER_COLORS,
  POSTER_CHARACTER_SIZE,
  POSTER_FRAME_RADIUS,
  POSTER_FRAME_SHADOW,
} from "./colors";

export const POSTER_PIXEL_FRAME_FACE_STYLE = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  width: POSTER_CHARACTER_SIZE,
  height: POSTER_CHARACTER_SIZE,
  borderRadius: POSTER_FRAME_RADIUS,
  border: `3px solid ${POSTER_COLORS.border}`,
  overflow: "hidden" as const,
  boxSizing: "border-box" as const,
  background: POSTER_COLORS.white,
};

export function posterPixelFrameShellStyle(width: number, height: number) {
  return {
    position: "relative" as const,
    width,
    height,
    margin: "0 auto",
  };
}

export function posterPixelFrameShadowStyle(
  size: number,
  radius: number | string,
  offsetX = POSTER_FRAME_SHADOW.x,
  offsetY = POSTER_FRAME_SHADOW.y
) {
  return {
    position: "absolute" as const,
    left: offsetX,
    top: offsetY,
    width: size,
    height: size,
    borderRadius: radius,
    background: POSTER_COLORS.border,
  };
}

export const POSTER_CHARACTER_IMAGE_STYLE = {
  display: "block" as const,
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
};

export const POSTER_MEDAL_SIZE = 88;
export const POSTER_MEDAL_SHADOW = { x: 3, y: 4 };
export const POSTER_CHAR_COLUMN_WIDTH =
  POSTER_CHARACTER_SIZE + POSTER_FRAME_SHADOW.x;
export const POSTER_MEDAL_COLUMN_WIDTH = POSTER_MEDAL_SIZE + POSTER_MEDAL_SHADOW.x;

export const POSTER_MEDAL_FACE_STYLE = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  width: POSTER_MEDAL_SIZE,
  height: POSTER_MEDAL_SIZE,
  borderRadius: "50%",
  border: `4px solid ${POSTER_COLORS.goldDark}`,
  background: POSTER_COLORS.medalGradient,
  display: "flex" as const,
  flexDirection: "column" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  boxSizing: "border-box" as const,
};
