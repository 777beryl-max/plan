import "server-only";

import { MAX_AVATAR_GENERATIONS } from "@/lib/avatar/limits";

const memoryStore = new Map<string, number>();

const REDIS_KEY_PREFIX = "bullet-plan:avatar-gen:";

function hasRedisEnv(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)?.trim() &&
      (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)?.trim()
  );
}

async function getRedisCount(key: string): Promise<number | null> {
  if (!hasRedisEnv()) return null;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const val = await redis.get<number>(`${REDIS_KEY_PREFIX}${key}`);
    return typeof val === "number" ? val : 0;
  } catch {
    return null;
  }
}

async function setRedisCount(key: string, count: number): Promise<boolean> {
  if (!hasRedisEnv()) return false;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    await redis.set(`${REDIS_KEY_PREFIX}${key}`, count);
    return true;
  } catch {
    return false;
  }
}

export async function getTrackedGenerationCount(key: string): Promise<number> {
  const redisCount = await getRedisCount(key);
  if (redisCount !== null) return redisCount;
  return memoryStore.get(key) ?? 0;
}

export async function setTrackedGenerationCount(key: string, count: number): Promise<void> {
  memoryStore.set(key, count);
  await setRedisCount(key, count);
}

export async function resetAvatarGeneration(key: string): Promise<void> {
  memoryStore.delete(key);
  if (!hasRedisEnv()) return;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    await redis.del(`${REDIS_KEY_PREFIX}${key}`);
  } catch {
    /* ignore */
  }
}

export interface AvatarGenerationCheck {
  allowed: boolean;
  count: number;
  remaining: number;
}

export async function reserveAvatarGeneration(
  key: string,
  clientReportedCount = 0
): Promise<AvatarGenerationCheck> {
  const serverCount = await getTrackedGenerationCount(key);
  const current = Math.max(serverCount, clientReportedCount);

  if (current > serverCount) {
    await setTrackedGenerationCount(key, current);
  }

  if (current >= MAX_AVATAR_GENERATIONS) {
    return {
      allowed: false,
      count: current,
      remaining: 0,
    };
  }

  const newCount = current + 1;
  await setTrackedGenerationCount(key, newCount);

  return {
    allowed: true,
    count: newCount,
    remaining: Math.max(0, MAX_AVATAR_GENERATIONS - newCount),
  };
}
