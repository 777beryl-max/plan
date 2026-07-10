import type { CompanionSpecies } from "@/lib/types";

/** 16×16 像素圖：. 透明，其餘為色碼字元 */
export type PixelRows = string[];

export interface SpeciesSprite {
  rows: PixelRows;
  palette: Record<string, string>;
}

const cat: SpeciesSprite = {
  palette: {
    O: "#f39c12",
    o: "#d68910",
    W: "#fdebd0",
    K: "#1a1a2e",
    P: "#e59866",
  },
  rows: [
    "......OOOO......",
    ".....OOOOOO.....",
    "....OOOOOOOO....",
    "...OOOOOOOOOO...",
    "..OOOOOO..OOOO..",
    ".OOOOOO....OOOO.",
    ".OOOOOOOOOOOOOO.",
    "OOOOOOOOOOOOOOOO",
    "OOOKOOOOOOOOKO.O",
    "OOOOOOOOOOOOOOOO",
    "OO.OOOOOOOOOO.OO",
    "..OO........OO..",
    "...OO......OO...",
    "....OO....OO....",
    ".....OOOOOO.....",
    "......OOOO......",
  ],
};

const dog: SpeciesSprite = {
  palette: {
    O: "#e67e22",
    o: "#ca6f1e",
    W: "#fdebd0",
    K: "#1a1a2e",
    P: "#a04000",
  },
  rows: [
    "OO............OO",
    "OOO..........OOO",
    "OOOO........OOOO",
    ".OOOO......OOOO.",
    "..OOOOOOOOOOOO..",
    ".OOOOOOOOOOOOOO.",
    "OOOOOOOOOOOOOOOO",
    "OOOKOOOOOOOOKO.O",
    "OOOOOOOOOOOOOOOO",
    "OOOO.OOOOOO.OOOO",
    ".OOO.OOOOOO.OOO.",
    "..OO........OO..",
    "...OO......OO...",
    "....OO....OO....",
    ".....OOOOOO.....",
    "......OOOO......",
  ],
};

const fox: SpeciesSprite = {
  palette: {
    O: "#e74c3c",
    o: "#c0392b",
    W: "#ffffff",
    K: "#1a1a2e",
    P: "#ff8c69",
  },
  rows: [
    "......OOOO......",
    ".....OOOOOO.....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "..OOOO....OOOO..",
    ".OOOO......OOOO.",
    ".OOOOOOOOOOOOOO.",
    "OOOOOWWWWWWOOOOO",
    "OOOKOWWWWWWOKOOO",
    "OOOOOWWWWWWOOOOO",
    "OOOOOOOOOOOOOOOO",
    "..OO........OO..",
    "...OO......OO...",
    "....OO....OO....",
    ".....OOOOOO.....",
    "......OOOO......",
  ],
};

const rabbit: SpeciesSprite = {
  palette: {
    O: "#fd79a8",
    o: "#e84393",
    W: "#ffffff",
    K: "#1a1a2e",
    P: "#fab1c8",
  },
  rows: [
    "..OO......OO....",
    "..OO......OO....",
    "..OO......OO....",
    "..OOOO..OOOO....",
    "...OOOOOOOO.....",
    "....OOOOOO......",
    "...OOOOOOOO.....",
    "..OOOOOOOOOO....",
    ".OOOOOWWWWOOOO..",
    ".OOOKOWWWWOKOO..",
    ".OOOOOWWWWOOOO..",
    "..OOOOOOOOOO....",
    "...OO....OO.....",
    "....OO..OO......",
    ".....OOOO.......",
    "......OO........",
  ],
};

const bear: SpeciesSprite = {
  palette: {
    O: "#a0522d",
    o: "#7a3e1d",
    W: "#d7b899",
    K: "#1a1a2e",
    P: "#c68642",
  },
  rows: [
    "OO............OO",
    "OOO..........OOO",
    "OOOO........OOOO",
    ".OOOOOOOOOOOOOO.",
    ".OOOOOOOOOOOOOO.",
    "OOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOO",
    "OOOKOOOOOOOOKO.O",
    "OOOOOWWWWWWOOOOO",
    "OOOOOOOOOOOOOOOO",
    "OOOO.OOOOOO.OOOO",
    "..OO........OO..",
    "...OO......OO...",
    "....OO....OO....",
    ".....OOOOOO.....",
    "......OOOO......",
  ],
};

const owl: SpeciesSprite = {
  palette: {
    O: "#8e44ad",
    o: "#6c3483",
    W: "#f5eef8",
    K: "#1a1a2e",
    P: "#d2b4de",
    Y: "#f7d51d",
  },
  rows: [
    "......OOOO......",
    ".....OOOOOO.....",
    "....OOOOOOOO....",
    "...OOOOOOOOOO...",
    "..OOOOOOOOOOOO..",
    ".OOOOOOOOOOOOOO.",
    "OOOOOOOOOOOOOOOO",
    "OOOKOOOOOOOOKO.O",
    "OOOOWWWWWWWWOOOO",
    "OOOOYOOOOOOYOOOO",
    "OOOOOOOOOOOOOOOO",
    "..OO........OO..",
    "...OO......OO...",
    "....OO....OO....",
    ".....OOOOOO.....",
    "......OOOO......",
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
