import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { UserDataBundle } from "@/lib/sync/types";
import type { StoredAccount } from "@/lib/auth/types";

const ACCOUNTS_KEY = "bullet-plan:accounts";

function userDataKey(userId: string) {
  return `bullet-plan:user:${userId}`;
}

export class StorageUnavailableError extends Error {
  constructor() {
    super(
      "伺服器資料庫尚未設定，請在 Vercel 安裝 Upstash Redis 並重新部署後再試"
    );
    this.name = "StorageUnavailableError";
  }
}

function hasRedisEnv(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)?.trim() &&
      (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)?.trim()
  );
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function useFileStorage(): boolean {
  return !isVercelRuntime() && !hasRedisEnv();
}

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!hasRedisEnv()) {
    throw new StorageUnavailableError();
  }
  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }
  return redisClient;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function userDataPath(userId: string) {
  return path.join(DATA_DIR, "users", `${userId}.json`);
}

async function readAccountsFromFile(): Promise<StoredAccount[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ACCOUNTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAccountsToFile(accounts: StoredAccount[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf8");
}

async function loadUserDataFromFile(userId: string): Promise<UserDataBundle | null> {
  try {
    const raw = await fs.readFile(userDataPath(userId), "utf8");
    return JSON.parse(raw) as UserDataBundle;
  } catch {
    return null;
  }
}

async function saveUserDataToFile(userId: string, bundle: UserDataBundle): Promise<void> {
  await ensureDataDir();
  await fs.mkdir(path.join(DATA_DIR, "users"), { recursive: true });
  await fs.writeFile(
    userDataPath(userId),
    JSON.stringify({ ...bundle, exportedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

export async function readAccounts(): Promise<StoredAccount[]> {
  if (useFileStorage()) {
    return readAccountsFromFile();
  }
  const data = await getRedis().get<StoredAccount[]>(ACCOUNTS_KEY);
  return data ?? [];
}

export async function writeAccounts(accounts: StoredAccount[]): Promise<void> {
  if (useFileStorage()) {
    await writeAccountsToFile(accounts);
    return;
  }
  await getRedis().set(ACCOUNTS_KEY, accounts);
}

export async function loadUserData(userId: string): Promise<UserDataBundle | null> {
  if (useFileStorage()) {
    return loadUserDataFromFile(userId);
  }
  return getRedis().get<UserDataBundle>(userDataKey(userId));
}

export async function saveUserData(userId: string, bundle: UserDataBundle): Promise<void> {
  const payload = { ...bundle, exportedAt: new Date().toISOString() };
  if (useFileStorage()) {
    await saveUserDataToFile(userId, payload);
    return;
  }
  await getRedis().set(userDataKey(userId), payload);
}

export function toAuthErrorMessage(err: unknown, fallback = "操作失敗"): string {
  if (err instanceof StorageUnavailableError) {
    return err.message;
  }
  if (err instanceof Error) {
    if (
      err.message.includes("ENOENT") ||
      err.message.includes("mkdir") ||
      err.message.includes("read-only")
    ) {
      return "伺服器儲存尚未設定，請稍後再試";
    }
    if (err.message.includes("AUTH_SECRET")) {
      return "伺服器登入設定未完成，請稍後再試";
    }
    return err.message;
  }
  return fallback;
}
