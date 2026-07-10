export const ADVENTURER_LEVELS = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 100 },
  { level: 3, minXp: 250 },
  { level: 4, minXp: 450 },
  { level: 5, minXp: 700 },
  { level: 6, minXp: 1000 },
  { level: 7, minXp: 1400 },
  { level: 8, minXp: 1900 },
  { level: 9, minXp: 2500 },
  { level: 10, minXp: 3200 },
] as const;

export const MAX_ADVENTURER_LEVEL = ADVENTURER_LEVELS[ADVENTURER_LEVELS.length - 1].level;

export function getAdventurerLevel(adventurerXp: number): number {
  let level = 1;
  for (const tier of ADVENTURER_LEVELS) {
    if (adventurerXp >= tier.minXp) level = tier.level;
  }
  return level;
}

export function getAdventurerProgress(adventurerXp: number): {
  level: number;
  currentXp: number;
  xpForNextLevel: number | null;
  progressPercent: number;
} {
  const level = getAdventurerLevel(adventurerXp);
  const currentTier = ADVENTURER_LEVELS.find((t) => t.level === level)!;
  const nextTier = ADVENTURER_LEVELS.find((t) => t.level === level + 1);

  if (!nextTier) {
    return {
      level,
      currentXp: adventurerXp - currentTier.minXp,
      xpForNextLevel: null,
      progressPercent: 100,
    };
  }

  const xpForNextLevel = nextTier.minXp - currentTier.minXp;
  const currentXp = adventurerXp - currentTier.minXp;

  return {
    level,
    currentXp,
    xpForNextLevel,
    progressPercent: Math.min(100, Math.round((currentXp / xpForNextLevel) * 100)),
  };
}
