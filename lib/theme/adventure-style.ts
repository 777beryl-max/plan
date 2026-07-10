import type { CharacterGender, CharacterStyle } from "@/lib/types";

/** 與 globals.css 一致的可愛冒險遊戲調色 */
export const ADVENTURE_COLORS = {
  sky: "#9edcff",
  skyDeep: "#6ec6ff",
  surface: "#fff9f0",
  surface2: "#fff0d4",
  accent: "#ff9f43",
  accent2: "#ff6b9d",
  gold: "#ffd93d",
  mp: "#4ecdc4",
  grass: "#7ed957",
  border: "#6b4f3a",
  text: "#5d4037",
  cream: "#fff8f0",
  blush: "#ffb3c6",
  blushDeep: "#ff8fab",
} as const;

const STYLE_PROMPTS: Record<CharacterStyle, string> = {
  brave: "brave cute adventurer with small wooden sword, confident cheerful smile",
  healing: "gentle healer with leaf staff, warm caring smile, soft pastel robes",
  scholar: "curious scholar with tiny book, bright thoughtful eyes, cozy outfit",
};

const GENDER_PROMPTS: Record<CharacterGender, string> = {
  male: "young male adventurer, soft masculine features",
  female: "young female adventurer, soft feminine features",
  neutral: "androgynous adventurer, gentle neutral features",
};

/** AI 頭像：與全站可愛冒險 UI、夥伴像素寵物同一視覺語言 */
export function buildCharacterImagePrompt(options: {
  style: CharacterStyle;
  gender: CharacterGender;
  referenceDesc?: string;
}): string {
  const { style, gender, referenceDesc } = options;
  const parts = [
    "cute chibi adventure game hero portrait",
    "kawaii cozy RPG character select art",
    "soft pastel illustration, round friendly shapes",
    "big sparkling eyes, rosy cheeks, warm smile",
    "color palette: sky blue, cream, coral orange, mint green, soft gold accents",
    `light sky blue background ${ADVENTURE_COLORS.sky}`,
    "matching cute mobile adventure game and companion pet style",
    "2D game art, soft brown outlines, not dark or realistic",
    GENDER_PROMPTS[gender],
    STYLE_PROMPTS[style],
  ];

  if (referenceDesc) {
    parts.push(`face and outfit inspired by reference: ${referenceDesc}`);
  }

  parts.push("front facing bust portrait", "no text", "no watermark", "no photo realism");

  return parts.join(", ");
}

/** 夥伴像素圖共用色（與 ADVENTURE_COLORS 對齊） */
export const COMPANION_PIXEL = {
  cream: ADVENTURE_COLORS.cream,
  eye: ADVENTURE_COLORS.text,
  blush: ADVENTURE_COLORS.blush,
  blushDeep: ADVENTURE_COLORS.blushDeep,
  highlight: ADVENTURE_COLORS.gold,
  shine: "#fff5e6",
} as const;
