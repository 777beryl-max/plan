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
    useCompanionStore.getState().loadProgress(),
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

  const sessionInitStarted = useRef(false);
  const bootstrapPromise = useRef<Promise<void> | null>(null);
  const redirected = useRef(false);

  const runBootstrapOnce = () => {
    if (!bootstrapPromise.current) {
      bootstrapPromise.current = bootstrapStores();
    }
    return bootstrapPromise.current;
  };

  useEffect(() => {
    if (sessionInitStarted.current) return;
    sessionInitStarted.current = true;

    void (async () => {
      const ok = await checkSession();
      const currentUser = useAuthStore.getState().user;
      if (!ok || !currentUser) return;

      setActiveUserId(currentUser.id);
      await pullFromServer();
      await runBootstrapOnce();
    })();
  }, [checkSession, pullFromServer]);

  useEffect(() => {
    if (authLoading || !user) return;
    setActiveUserId(user.id);
    void runBootstrapOnce();
  }, [authLoading, user]);

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
    }
  }, [authLoading, user, pathname, router]);

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
