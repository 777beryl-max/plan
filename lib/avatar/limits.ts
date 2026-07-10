/** 首次生成 1 次 + 可換頭像 2 次 */
export const MAX_AVATAR_GENERATIONS = 3;
export const MAX_AVATAR_CHANGES = MAX_AVATAR_GENERATIONS - 1;

export function effectiveAvatarGenerationCount(profile: {
  avatarGenerationCount?: number;
  aiCharacterUrl?: string;
}): number {
  if (typeof profile.avatarGenerationCount === "number") {
    return profile.avatarGenerationCount;
  }
  return profile.aiCharacterUrl ? 1 : 0;
}

export function getRemainingAvatarChanges(profile: {
  avatarGenerationCount?: number;
  aiCharacterUrl?: string;
}): number {
  return Math.max(0, MAX_AVATAR_GENERATIONS - effectiveAvatarGenerationCount(profile));
}

export function canGenerateAvatar(profile: {
  avatarGenerationCount?: number;
  aiCharacterUrl?: string;
}): boolean {
  return getRemainingAvatarChanges(profile) > 0;
}
