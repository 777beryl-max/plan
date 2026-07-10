"use client";

import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AuthMenu } from "./AuthMenu";
import { PomodoroWatcher } from "@/components/focus/PomodoroWatcher";
import { PomodoroFloatingTimer } from "@/components/focus/PomodoroFloatingTimer";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="adventure-world text-[var(--pixel-text)]">
      <PomodoroWatcher />
      <PomodoroFloatingTimer />
      <div className="adventure-content min-h-screen flex flex-col">
        <header className="game-banner sticky top-0 z-30">
          <div className="game-banner-inner">
            <div className="game-banner-brand">
              <span className="game-banner-icon float-gentle" aria-hidden>
                ⚔️
              </span>
              <h1 className="game-banner-title">人生冒險遊戲</h1>
            </div>
            <AuthMenu />
          </div>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 pb-32 sm:px-5">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
