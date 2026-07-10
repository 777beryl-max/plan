import { ADVENTURE_COLORS, COMPANION_PIXEL } from "@/lib/theme/adventure-style";
import type { CompanionSpecies } from "@/lib/types";

/** 16×16 像素圖：. 透明 */
export type PixelRows = string[];

export interface SpeciesSprite {
  rows: PixelRows;
  palette: Record<string, string>;
}

const CUTE = {
  R: COMPANION_PIXEL.blush,
  r: COMPANION_PIXEL.blushDeep,
  H: COMPANION_PIXEL.shine,
  h: COMPANION_PIXEL.highlight,
};

const cat: SpeciesSprite = {
  palette: {
    O: ADVENTURE_COLORS.accent,
    o: "#ff8c42",
    W: COMPANION_PIXEL.cream,
    K: COMPANION_PIXEL.eye,
    P: ADVENTURE_COLORS.surface2,
    B: ADVENTURE_COLORS.skyDeep,
    ...CUTE,
  },
  rows: [
    ".....OO..OO.....",
    "....OOOOOOOO....",
    "...OOOOOOOOOO...",
    "..OOOWWWWWWOOO..",
    "..OWWKooKWWOOO..",
    "..OOORRRRRROOO..",
    "...OOOOOOOOOO...",
    "...OBBBBBBBBBO..",
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    "................",
  ],
};

const dog: SpeciesSprite = {
  palette: {
    O: "#e8b86d",
    o: "#d4a05a",
    W: COMPANION_PIXEL.cream,
    K: COMPANION_PIXEL.eye,
    P: ADVENTURE_COLORS.surface2,
    B: ADVENTURE_COLORS.skyDeep,
    ...CUTE,
  },
  rows: [
    "OO............OO",
    "OOO..OOOO..OOO..",
    ".OOOOOOOOOOOOO..",
    "..OOOWWWWWWOOO..",
    "..OWWKooKWWOOO..",
    "..OOORRRRRROOO..",
    "...OOOOOOOOOO...",
    "...OBBBBBBBBBO..",
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    "................",
  ],
};

const fox: SpeciesSprite = {
  palette: {
    O: ADVENTURE_COLORS.accent,
    o: "#ff8c5a",
    W: COMPANION_PIXEL.cream,
    K: COMPANION_PIXEL.eye,
    P: "#ffc9a8",
    B: ADVENTURE_COLORS.skyDeep,
    ...CUTE,
  },
  rows: [
    ".....OO..OO.....",
    "....OOOOOOOO....",
    "...OOOOOOOOOO...",
    "..OOOOOWWWWOOO..",
    "..OOOWWKooKOOO..",
    "..OOOORRRRRROO..",
    "...OOOOOWWWWOO..",
    "...OBBBBBBBBBO..",
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    "................",
  ],
};

const rabbit: SpeciesSprite = {
  palette: {
    O: ADVENTURE_COLORS.accent2,
    o: "#ff85b3",
    W: COMPANION_PIXEL.cream,
    K: COMPANION_PIXEL.eye,
    P: "#ffd4e5",
    B: ADVENTURE_COLORS.skyDeep,
    ...CUTE,
  },
  rows: [
    "..OO......OO....",
    "..OO......OO....",
    "..OOOO..OOOO....",
    "...OOOOOOOOO....",
    "..OOOWWWWWWOO...",
    "..OWWKooKWWOO...",
    "..OOORRRRRROO...",
    "...OBBBBBBBBBO..",
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    "................",
  ],
};

const bear: SpeciesSprite = {
  palette: {
    O: "#c9a66b",
    o: "#b08d55",
    W: COMPANION_PIXEL.cream,
    K: COMPANION_PIXEL.eye,
    P: ADVENTURE_COLORS.surface2,
    B: ADVENTURE_COLORS.skyDeep,
    ...CUTE,
  },
  rows: [
    "OO............OO",
    "OOO..........OOO",
    ".OOOOOOOOOOOOOO.",
    "..OOOWWWWWWOOO..",
    "..OWWKooKWWOOO..",
    "..OOORRRRRROOO..",
    "...OOOOOOOOOO...",
    "...OBBBBBBBBBO..",
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    "................",
  ],
};

const owl: SpeciesSprite = {
  palette: {
    O: "#a88fd4",
    o: "#8f74c4",
    W: COMPANION_PIXEL.cream,
    K: COMPANION_PIXEL.eye,
    P: "#e0d4f5",
    B: ADVENTURE_COLORS.skyDeep,
    Y: ADVENTURE_COLORS.gold,
    ...CUTE,
  },
  rows: [
    ".....OO..OO.....",
    "....OOOOOOOO....",
    "...OOOOOOOOOO...",
    "..OOOWWWWWWOOO..",
    "..OWWKooKWWOOO..",
    "..OOOYRRRRYOOO..",
    "...OOOOOOOOOO...",
    "...OBBBBBBBBBO..",
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    "................",
  ],
};

export const SPECIES_SPRITES: Record<CompanionSpecies, SpeciesSprite> = {
  cat,
  dog,
  fox,
  rabbit,
  bear,
  owl,
};
