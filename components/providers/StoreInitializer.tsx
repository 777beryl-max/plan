"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGoalStore } from "@/stores/goalStore";
import { usePlanStore } from "@/stores/planStore";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useCompanionStore } from "@/stores/companionStore";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { setActiveUserId } from "@/lib/repositories";
import { AutoSync } from "@/components/providers/AutoSync";

const PUBLIC_PATHS = ["/login"];

async function bootstrapStores() {
  await Promise.all([
    useGoalStore.getState().loadGoals(),
    usePlanStore.getState().loadAll(),
    usePomodoroStore.getState().loadSessions(),
    useCompanionStore.getState().loadCompanion(),
    useAppStore.getState().loadProfile(),
    useAppStore.getState().loadWeeklyReports(),
  ]);
}

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const checkSession = useAuthStore((s) => s.checkSession);
  const pullFromServer = useAuthStore((s) => s.pullFromServer);
  const onboardingDone = useAppStore((s) => s.profile?.onboardingDone);
  const profileLoaded = useAppStore((s) => s.profile !== null);
  const profileLoading = useAppStore((s) => s.loading);

  const authChecked = useRef(false);
  const storesBootstrapped = useRef(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;

    void (async () => {
      const ok = await checkSession();
      if (ok) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setActiveUserId(currentUser.id);
          await pullFromServer();
        }
      }
      if (useAuthStore.getState().user) {
        storesBootstrapped.current = true;
        await bootstrapStores();
      }
    })();
  }, [checkSession, pullFromServer]);

  useEffect(() => {
    if (authLoading) return;

    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      if (!redirected.current) {
        redirected.current = true;
        router.replace("/login");
      }
      return;
    }

    if (user && pathname === "/login") {
      router.replace("/");
      return;
    }

    if (user && !storesBootstrapped.current) {
      storesBootstrapped.current = true;
      setActiveUserId(user.id);
      void pullFromServer().then(() => bootstrapStores());
    }
  }, [authLoading, user, pathname, router, pullFromServer]);

  useEffect(() => {
    if (authLoading || !user || profileLoading || !profileLoaded || redirected.current) return;
    if (onboardingDone === false && pathname !== "/onboarding" && pathname !== "/login") {
      redirected.current = true;
      router.replace("/onboarding");
    }
  }, [authLoading, user, profileLoading, profileLoaded, onboardingDone, pathname, router]);

  return (
    <>
      <AutoSync />
      {children}
    </>
  );
}
