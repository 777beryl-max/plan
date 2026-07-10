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
    <div className="flex flex-wrap justify-end gap-1 shrink-0">
      <HeaderActionLink href="/settings">設定</HeaderActionLink>
        {user && (
          <>
            <HeaderActionButton
              onClick={() => void pushToServer()}
              disabled={syncing}
              className={syncing ? "opacity-70" : ""}
            >
              {syncLabel}
            </HeaderActionButton>
            <HeaderActionButton
              onClick={() => void logout().then(() => window.location.assign("/login"))}
            >
              登出
            </HeaderActionButton>
          </>
        )}
    </div>
  );
}
