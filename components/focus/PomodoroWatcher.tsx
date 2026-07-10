"use client";

import { useEffect } from "react";
import { usePomodoroStore } from "@/stores/pomodoroStore";

/** 全域番茄鐘同步：螢幕關閉、切換 App、回到前景時自動校正並結算 */
export function PomodoroWatcher() {
  useEffect(() => {
    const store = usePomodoroStore.getState();
    store.initPreferences();
    store.hydrate();
    store.syncTimer();

    const sync = () => usePomodoroStore.getState().syncTimer();

    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") sync();
    }, 1000);

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  return null;
}
