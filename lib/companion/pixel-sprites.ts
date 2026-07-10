import type { CompanionSpecies } from "@/lib/types";

/** 16×16 像素圖：. 透明 */
export type PixelRows = string[];

export interface SpeciesSprite {
  rows: PixelRows;
  palette: Record<string, string>;
}

/** 共用可愛色：腮紅、高光、大眼睛 */
const CUTE = {
  R: "#ffb3c6",
  r: "#ff8fab",
  H: "#fff5e6",
  h: "#ffeaa7",
};

const cat: SpeciesSprite = {
  palette: {
    O: "#ffb347",
    o: "#ff9f1c",
    W: "#fff8f0",
    K: "#4a3728",
    P: "#ffd89b",
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
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    ".OO..........OO.",
    "................",
  ],
};

const dog: SpeciesSprite = {
  palette: {
    O: "#d4a574",
    o: "#c4956a",
    W: "#fff8f0",
    K: "#4a3728",
    P: "#e8c9a0",
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
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    ".OO..........OO.",
    "................",
  ],
};

const fox: SpeciesSprite = {
  palette: {
    O: "#ff7b54",
    o: "#ff6b45",
    W: "#fff8f0",
    K: "#4a3728",
    P: "#ffa07a",
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
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    ".OO..........OO.",
    "................",
  ],
};

const rabbit: SpeciesSprite = {
  palette: {
    O: "#ffb8d0",
    o: "#ff9ec5",
    W: "#fff8f0",
    K: "#4a3728",
    P: "#ffd4e5",
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
    "...OOOOOOOOO....",
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
    O: "#c49a6c",
    o: "#a67c52",
    W: "#fff8f0",
    K: "#4a3728",
    P: "#ddb892",
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
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    ".OO..........OO.",
    "................",
  ],
};

const owl: SpeciesSprite = {
  palette: {
    O: "#b19cd9",
    o: "#9b7ec8",
    W: "#fff8f0",
    K: "#4a3728",
    P: "#d4c4f0",
    Y: "#ffe066",
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
    "....OOOOOOOO....",
    ".....OOOOOO.....",
    "......OOOO......",
    ".....OO..OO.....",
    "....OO....OO....",
    "...OO......OO...",
    "..OO........OO..",
    ".OO..........OO.",
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
