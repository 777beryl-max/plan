"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AutoSync() {
  const user = useAuthStore((s) => s.user);
  const pushToServer = useAuthStore((s) => s.pushToServer);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      void pushToServer();
    }, 3 * 60 * 1000);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        void pushToServer();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, pushToServer]);

  return null;
}
