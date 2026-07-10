import "server-only";

import { v4 as uuidv4 } from "uuid";
import type { UserDataBundle } from "@/lib/sync/types";
import type { AuthUser } from "@/lib/auth/types";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  loadUserData as loadStoredUserData,
  readAccounts,
  saveUserData as saveStoredUserData,
  writeAccounts,
} from "@/lib/auth/storage";

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
    companionProgress: [],
    companionRewardLogs: [],
    adventurerRewardLogs: [],
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
  await saveStoredUserData(userId, bundle);
}

export async function loadUserData(userId: string): Promise<UserDataBundle | null> {
  return loadStoredUserData(userId);
}
