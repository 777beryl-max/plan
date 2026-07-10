"use client";

import { useEffect } from "react";
import { useCompanionStore } from "@/stores/companionStore";

export function RewardToast() {
  const toast = useCompanionStore((s) => s.lastRewardToast);
  const clearRewardToast = useCompanionStore((s) => s.clearRewardToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => clearRewardToast(), 2000);
    return () => clearTimeout(timer);
  }, [toast, clearRewardToast]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pixel-card border-[3px] border-[var(--pixel-gold-dark)] bg-[var(--pixel-surface)] px-4 py-2 shadow-lg animate-[fadeIn_0.2s_ease-out]">
        <p className="font-body text-base text-[var(--pixel-accent)] font-bold whitespace-nowrap">
          +{toast.amount} {toast.label}
        </p>
      </div>
    </div>
  );
}
