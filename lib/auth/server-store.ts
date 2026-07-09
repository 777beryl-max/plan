import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { UserDataBundle } from "@/lib/sync/types";
import type { AuthUser, StoredAccount } from "@/lib/auth/types";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readAccounts(): Promise<StoredAccount[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ACCOUNTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAccounts(accounts: StoredAccount[]) {
  await ensureDataDir();
  await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf8");
}

function userDataPath(userId: string) {
  return path.join(DATA_DIR, "users", `${userId}.json`);
}

export async function registerAccount(
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = await readAccounts();
  if (accounts.some((a) => a.email === normalizedEmail)) {
    throw new Error("此 Email 已被註冊");
  }

  const user: AuthUser = {
    id: uuidv4(),
    email: normalizedEmail,
    displayName: displayName.trim() || "冒險者",
    createdAt: new Date().toISOString(),
  };

  const passwordHash = await hashPassword(password);
  accounts.push({
    id: user.id,
    email: user.email,
    passwordHash,
    displayName: user.displayName,
    createdAt: user.createdAt,
  });
  await writeAccounts(accounts);

  const emptyBundle: UserDataBundle = {
    goals: [],
    monthPlans: [],
    weekPlans: [],
    dayTasks: [],
    pomodoroSessions: [],
    companions: [],
    userProfiles: [],
    weeklyReports: [],
    exportedAt: new Date().toISOString(),
  };
  await saveUserData(user.id, emptyBundle);

  return user;
}

export async function authenticateAccount(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = await readAccounts();
  const account = accounts.find((a) => a.email === normalizedEmail);
  if (!account) return null;

  const ok = await verifyPassword(password, account.passwordHash);
  if (!ok) return null;

  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    createdAt: account.createdAt,
  };
}

export async function getAccountById(userId: string): Promise<AuthUser | null> {
  const accounts = await readAccounts();
  const account = accounts.find((a) => a.id === userId);
  if (!account) return null;
  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    createdAt: account.createdAt,
  };
}

export async function saveUserData(userId: string, bundle: UserDataBundle): Promise<void> {
  await ensureDataDir();
  await fs.mkdir(path.join(DATA_DIR, "users"), { recursive: true });
  await fs.writeFile(
    userDataPath(userId),
    JSON.stringify({ ...bundle, exportedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

export async function loadUserData(userId: string): Promise<UserDataBundle | null> {
  try {
    const raw = await fs.readFile(userDataPath(userId), "utf8");
    return JSON.parse(raw) as UserDataBundle;
  } catch {
    return null;
  }
}
