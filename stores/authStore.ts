import { create } from "zustand";
import type { AuthUser } from "@/lib/auth/types";
import { exportUserDataBundle, importUserDataBundle, clearLocalUserData } from "@/lib/sync/bundle";
import { setActiveUserId, resetActiveUserId } from "@/lib/repositories";
import { getDeviceId } from "@/lib/device-id";

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  syncing: boolean;
  lastSyncedAt: string | null;
  checkSession: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
}

function authHeaders(): HeadersInit {
  const deviceId = getDeviceId();
  return {
    "Content-Type": "application/json",
    ...(deviceId ? { "x-device-id": deviceId } : {}),
  };
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  syncing: false,
  lastSyncedAt: null,

  checkSession: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.user) {
        set({ user: data.user, loading: false });
        return true;
      }
      set({ user: null, loading: false });
      return false;
    } catch {
      set({ user: null, loading: false });
      return false;
    }
  },

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "登入失敗");
    set({ user: data.user });
    setActiveUserId(data.user.id);
    await get().pullFromServer();
  },

  register: async (email, password, displayName) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({ email, password, displayName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "註冊失敗");
    set({ user: data.user });
    setActiveUserId(data.user.id);
    await importUserDataBundle(
      {
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
      },
      data.user.id,
      data.user.displayName
    );
  },

  logout: async () => {
    try {
      await get().pushToServer();
    } catch {
      // 仍允許登出
    }
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
    });
    await clearLocalUserData();
    resetActiveUserId();
    set({ user: null, lastSyncedAt: null });
  },

  pullFromServer: async () => {
    const user = get().user;
    if (!user) return;
    set({ syncing: true });
    try {
      const res = await fetch("/api/sync", { credentials: "include" });
      const payload = await res.json();
      if (!res.ok) {
        if (res.status === 429) return;
        throw new Error(payload.error ?? "下載失敗");
      }
      if (payload.data) {
        await importUserDataBundle(payload.data, user.id, user.displayName);
      } else {
        await importUserDataBundle(
          {
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
          },
          user.id,
          user.displayName
        );
      }
      set({ lastSyncedAt: payload.syncedAt ?? payload.data?.exportedAt ?? null });
    } finally {
      set({ syncing: false });
    }
  },

  pushToServer: async () => {
    const user = get().user;
    if (!user) return;
    set({ syncing: true });
    try {
      const bundle = await exportUserDataBundle();
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(bundle),
      });
      const payload = await res.json();
      if (!res.ok) {
        if (res.status === 429) return;
        throw new Error(payload.error ?? "上傳失敗");
      }
      set({ lastSyncedAt: payload.syncedAt ?? new Date().toISOString() });
    } finally {
      set({ syncing: false });
    }
  },
}));
