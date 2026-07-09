"use client";

import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AuthMenu } from "./AuthMenu";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--pixel-bg)] text-[var(--pixel-text)]">
      <header className="sticky top-0 z-30 border-b-4 border-[var(--pixel-border)] bg-[var(--pixel-surface)] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-pixel text-base text-[var(--pixel-accent)] leading-relaxed">
              人生冒險遊戲
            </h1>
            <p className="font-body text-base text-[var(--pixel-text-muted)] mt-1 truncate">
              把人生目標，變成能完成的日常
            </p>
          </div>
          <AuthMenu />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
