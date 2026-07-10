"use client";

import { useAuthStore } from "@/stores/authStore";
import { HeaderActionButton, HeaderActionLink } from "@/components/layout/HeaderActionButton";

export function AuthMenu() {
  const user = useAuthStore((s) => s.user);
  const syncing = useAuthStore((s) => s.syncing);
  const lastSyncedAt = useAuthStore((s) => s.lastSyncedAt);
  const pushToServer = useAuthStore((s) => s.pushToServer);
  const logout = useAuthStore((s) => s.logout);

  const syncLabel = syncing ? "同步中..." : lastSyncedAt ? "已同步" : "同步";

  return (
    <div className="game-banner-actions">
      <HeaderActionLink href="/settings" aria-label="設定">
        <span className="sm:hidden" aria-hidden>
          ⚙️
        </span>
        <span className="hidden sm:inline">設定</span>
      </HeaderActionLink>
      {user && (
        <>
          <HeaderActionButton
            onClick={() => void pushToServer()}
            disabled={syncing}
            className={syncing ? "opacity-70" : ""}
            aria-label={syncLabel}
          >
            <span className="sm:hidden" aria-hidden>
              {syncing ? "…" : lastSyncedAt ? "✓" : "↻"}
            </span>
            <span className="hidden sm:inline">{syncLabel}</span>
          </HeaderActionButton>
          <HeaderActionButton
            onClick={() => void logout().then(() => window.location.assign("/login"))}
            aria-label="登出"
          >
            <span className="sm:hidden" aria-hidden>
              出
            </span>
            <span className="hidden sm:inline">登出</span>
          </HeaderActionButton>
        </>
      )}
    </div>
  );
}
