import { v4 as uuidv4 } from "uuid";
import type { BaseEntity, SyncStatus } from "@/lib/types";

export function generateId(): string {
  return uuidv4();
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function createBaseEntity(syncStatus: SyncStatus = "local"): Pick<BaseEntity, "id" | "createdAt" | "updatedAt" | "syncStatus"> {
  const now = nowISO();
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    syncStatus,
  };
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} 分`;
  return `${h} 時 ${m} 分`;
}
