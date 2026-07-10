"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/stores/appStore";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { AdventureAvatar } from "@/components/ui/AdventureAvatar";
import { AvatarGenerator } from "@/components/avatar/AvatarGenerator";
import { getRemainingAvatarChanges } from "@/lib/avatar/limits";

export default function AvatarPage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [remainingChanges, setRemainingChanges] = useState<number | null>(null);

  if (!profile) {
    return (
      <div className="space-y-4">
        <PixelCard title="換頭像">
          <p className="font-body text-lg text-[var(--pixel-text-muted)]">載入中…</p>
        </PixelCard>
      </div>
    );
  }

  const remaining = remainingChanges ?? getRemainingAvatarChanges(profile);

  const handleSuccess = async (data: {
    url: string;
    style: "brave" | "healing" | "scholar";
    gender: "male" | "female" | "neutral";
    avatarGenerationCount: number;
    remainingChanges: number;
  }) => {
    await updateProfile({
      aiCharacterUrl: data.url,
      aiGeneratedAt: new Date().toISOString(),
      characterStyle: data.style,
      characterGender: data.gender,
      avatarGenerationCount: data.avatarGenerationCount,
    });
    setPreviewUrl(data.url);
    setRemainingChanges(data.remainingChanges);
  };

  return (
    <div className="space-y-4">
      <PixelCard title="🧙 換頭像" accent>
        {previewUrl ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <AdventureAvatar src={previewUrl} alt="新頭像" size="lg" />
            <p className="font-body text-lg text-[var(--pixel-text-muted)] text-center">
              頭像已更新！
              {remainingChanges !== null && remainingChanges > 0
                ? ` 還可再換 ${remainingChanges} 次。`
                : remainingChanges === 0
                  ? " 換頭像次數已用完。"
                  : ""}
            </p>
            <PixelButton onClick={() => router.push("/")} className="w-full" size="lg">
              回到基地
            </PixelButton>
          </div>
        ) : remaining <= 0 ? (
          <div className="text-center py-4 space-y-4">
            {profile.aiCharacterUrl && (
              <AdventureAvatar
                src={profile.aiCharacterUrl}
                alt="目前頭像"
                size="md"
                className="mx-auto"
              />
            )}
            <p className="font-body text-lg text-[var(--pixel-text-muted)]">
              換頭像次數已用完（最多 2 次）
            </p>
            <Link href="/">
              <PixelButton variant="ghost" className="w-full">
                回到基地
              </PixelButton>
            </Link>
          </div>
        ) : (
          <>
            {profile.aiCharacterUrl && (
              <div className="flex items-center gap-4 mb-4 p-3 border-[3px] border-[var(--pixel-border-soft)] rounded-xl bg-white/60">
                <AdventureAvatar src={profile.aiCharacterUrl} alt="目前頭像" size="sm" />
                <div>
                  <p className="text-label text-[var(--pixel-text-muted)]">目前頭像</p>
                  <p className="font-body text-base text-[var(--pixel-accent)]">
                    {profile.displayName}
                  </p>
                </div>
              </div>
            )}
            <AvatarGenerator
              displayName={profile.displayName}
              avatarGenerationCount={profile.avatarGenerationCount}
              aiCharacterUrl={profile.aiCharacterUrl}
              initialStyle={profile.characterStyle}
              initialGender={profile.characterGender}
              remainingChanges={remaining}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </PixelCard>
    </div>
  );
}
