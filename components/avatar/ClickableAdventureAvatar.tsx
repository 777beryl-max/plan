"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdventureAvatar } from "@/components/ui/AdventureAvatar";
import { PixelButton } from "@/components/ui/PixelButton";
import { getRemainingAvatarChanges } from "@/lib/avatar/limits";

interface ClickableAdventureAvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  profile: {
    avatarGenerationCount?: number;
    aiCharacterUrl?: string;
  } | null;
}

export function ClickableAdventureAvatar({
  src,
  alt,
  size = "md",
  profile,
}: ClickableAdventureAvatarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const remaining = profile ? getRemainingAvatarChanges(profile) : 0;

  const handleClick = () => {
    if (remaining <= 0) {
      setOpen(true);
      return;
    }
    setOpen(true);
  };

  const confirm = () => {
    setOpen(false);
    router.push("/avatar");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="group relative rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--pixel-gold)]"
        aria-label={src ? "更換頭像" : "生成頭像"}
      >
        {src ? (
          <AdventureAvatar
            src={src}
            alt={alt}
            size={size}
            className="transition-transform group-hover:scale-[1.03] group-active:scale-[0.98]"
          />
        ) : (
          <div className="adventure-placeholder w-[7.5rem] h-[7.5rem] transition-transform group-hover:scale-[1.03] group-active:scale-[0.98]">
            <span className="text-3xl opacity-50">🧙</span>
          </div>
        )}
        {remaining > 0 && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[var(--pixel-border)] bg-white px-2 py-0.5 text-[10px] font-bold text-[var(--pixel-accent)] opacity-0 transition-opacity group-hover:opacity-100">
            點擊更換
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal
          aria-labelledby="avatar-change-title"
        >
          <div className="w-full max-w-sm pixel-card border-[3px] border-[var(--pixel-border)] bg-[var(--pixel-surface)] p-5 shadow-xl">
            <h2 id="avatar-change-title" className="text-display text-[var(--pixel-accent)] mb-3">
              {remaining > 0 ? "⚠️ 更換頭像" : "無法更換"}
            </h2>
            <p className="font-body text-base text-[var(--pixel-text-muted)] leading-relaxed mb-5">
              {remaining > 0
                ? src
                  ? `更換頭像將使用 1 次機會，目前還剩 ${remaining} 次。確定要繼續嗎？`
                  : `將生成你的冒險者頭像，目前還剩 ${remaining} 次機會。確定要繼續嗎？`
                : "換頭像次數已用完（首次生成後最多可換 2 次）。"}
            </p>
            <div className="flex gap-2">
              <PixelButton variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
                取消
              </PixelButton>
              {remaining > 0 && (
                <PixelButton className="flex-1" onClick={confirm}>
                  確定
                </PixelButton>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
