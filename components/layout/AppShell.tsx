"use client";

import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AuthMenu } from "./AuthMenu";
import { PomodoroWatcher } from "@/components/focus/PomodoroWatcher";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="adventure-world text-[var(--pixel-text)]">
      <PomodoroWatcher />
      <div className="adventure-content min-h-screen flex flex-col">
        <header className="game-banner sticky top-0 z-30 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <span className="text-2xl float-gentle shrink-0" aria-hidden>
                ⚔️
              </span>
              <div className="min-w-0">
                <h1 className="game-banner-title font-pixel text-sm leading-relaxed">
                  人生冒險遊戲
                </h1>
                <p className="font-body text-sm text-[var(--pixel-text-muted)] mt-0.5 truncate">
                  把人生目標，變成能完成的日常
                </p>
              </div>
            </div>
            <AuthMenu />
          </div>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 pb-32">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
