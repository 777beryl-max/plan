"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { setActiveUserId } from "@/lib/repositories";
import { bootstrapStores, resetAllStores } from "@/lib/stores/bootstrap";
import { AutoSync } from "@/components/providers/AutoSync";

const PUBLIC_PATHS = ["/login"];

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
  const lastBootstrappedUserId = useRef<string | null>(null);
  const redirected = useRef(false);

  const reloadStores = async (userId: string) => {
    setActiveUserId(userId);
    lastBootstrappedUserId.current = userId;
    await bootstrapStores();
  };

  useEffect(() => {
    if (sessionInitStarted.current) return;
    sessionInitStarted.current = true;

    void (async () => {
      const ok = await checkSession();
      const currentUser = useAuthStore.getState().user;
      if (!ok || !currentUser) return;

      await pullFromServer();
      await reloadStores(currentUser.id);
    })();
  }, [checkSession, pullFromServer]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (lastBootstrappedUserId.current === user.id) return;
    void reloadStores(user.id);
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) {
      lastBootstrappedUserId.current = null;
    }
  }, [user]);

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
