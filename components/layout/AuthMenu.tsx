"use client";

import { useAuthStore } from "@/stores/authStore";
import { PixelButton } from "@/components/ui/PixelButton";

export function AuthMenu() {
  const user = useAuthStore((s) => s.user);
  const syncing = useAuthStore((s) => s.syncing);
  const lastSyncedAt = useAuthStore((s) => s.lastSyncedAt);
  const pushToServer = useAuthStore((s) => s.pushToServer);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const syncLabel = syncing
    ? "同步中..."
    : lastSyncedAt
      ? "已同步"
      : "同步";

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <p className="font-body text-base text-[var(--pixel-text-muted)] truncate max-w-[140px]">
        {user.displayName}
      </p>
      <div className="flex gap-1">
        <PixelButton
          variant="ghost"
          size="sm"
          onClick={() => void pushToServer()}
          disabled={syncing}
        >
          {syncLabel}
        </PixelButton>
        <PixelButton
          variant="ghost"
          size="sm"
          onClick={() => void logout().then(() => window.location.assign("/login"))}
        >
          登出
        </PixelButton>
      </div>
    </div>
  );
}
