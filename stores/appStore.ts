import { create } from "zustand";
import type { UserProfile, WeeklyReport } from "@/lib/types";
import {
  getUserProfile,
  saveUserProfile,
  getWeeklyReports,
  saveWeeklyReport,
  getWeeklyReport,
} from "@/lib/repositories";

interface AppStore {
  profile: UserProfile | null;
  weeklyReports: WeeklyReport[];
  loading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loadWeeklyReports: () => Promise<void>;
  saveReport: (report: WeeklyReport) => Promise<void>;
  getReport: (year: number, week: number) => Promise<WeeklyReport | undefined>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  profile: null,
  weeklyReports: [],
  loading: false,

  loadProfile: async () => {
    set({ loading: true });
    const profile = await getUserProfile();
    set({ profile, loading: false });
  },

  updateProfile: async (updates) => {
    const profile = get().profile ?? (await getUserProfile());
    const updated = { ...profile, ...updates };
    await saveUserProfile(updated);
    set({ profile: updated });
  },

  loadWeeklyReports: async () => {
    const reports = await getWeeklyReports();
    set({ weeklyReports: reports });
  },

  saveReport: async (report) => {
    await saveWeeklyReport(report);
    await get().loadWeeklyReports();
  },

  getReport: async (year, week) => getWeeklyReport(year, week),
}));
