export const BOND_LEVELS = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 30 },
  { level: 3, minXp: 80 },
  { level: 4, minXp: 150 },
  { level: 5, minXp: 250 },
] as const;

export const MAX_BOND_LEVEL = BOND_LEVELS[BOND_LEVELS.length - 1].level;

export function getBondLevel(bondXp: number): number {
  let level = 1;
  for (const tier of BOND_LEVELS) {
    if (bondXp >= tier.minXp) level = tier.level;
  }
  return level;
}

export function getBondProgress(bondXp: number): {
  level: number;
  currentXp: number;
  xpForNextLevel: number | null;
  progressPercent: number;
} {
  const level = getBondLevel(bondXp);
  const currentTier = BOND_LEVELS.find((t) => t.level === level)!;
  const nextTier = BOND_LEVELS.find((t) => t.level === level + 1);

  if (!nextTier) {
    return {
      level,
      currentXp: bondXp - currentTier.minXp,
      xpForNextLevel: null,
      progressPercent: 100,
    };
  }

  const xpForNextLevel = nextTier.minXp - currentTier.minXp;
  const currentXp = bondXp - currentTier.minXp;

  return {
    level,
    currentXp,
    xpForNextLevel,
    progressPercent: Math.min(100, Math.round((currentXp / xpForNextLevel) * 100)),
  };
}

export function isIntimateCompanion(bondXp: number): boolean {
  return getBondLevel(bondXp) >= 4;
}
