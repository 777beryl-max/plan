"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";
import { AdventureAvatar } from "@/components/ui/AdventureAvatar";
import { AvatarGenerator } from "@/components/avatar/AvatarGenerator";
import { getRemainingAvatarChanges } from "@/lib/avatar/limits";

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);

  if (profile?.onboardingDone) {
    return (
      <div className="adventure-world min-h-screen flex items-center justify-center p-4">
        <div className="adventure-content w-full max-w-md">
          <PixelCard title="引導已完成" accent>
            <p className="font-body text-lg text-[var(--pixel-text-muted)] mb-4 text-center">
              你已經完成冒險者引導，可以直接進入首頁。
            </p>
            <PixelButton onClick={() => router.push("/")} className="w-full">
              進入首頁
            </PixelButton>
          </PixelCard>
        </div>
      </div>
    );
  }

  const remainingChanges = profile ? getRemainingAvatarChanges(profile) : 3;
  const hasAvatar = Boolean(profile?.aiCharacterUrl);

  const handleSuccess = async (data: {
    url: string;
    style: "brave" | "healing" | "scholar";
    gender: "male" | "female" | "neutral";
    avatarGenerationCount: number;
    remainingChanges: number;
  }) => {
    setCharacterUrl(data.url);
    await updateProfile({
      displayName: displayName.trim(),
      aiCharacterUrl: data.url,
      aiGeneratedAt: new Date().toISOString(),
      characterStyle: data.style,
      characterGender: data.gender,
      avatarGenerationCount: data.avatarGenerationCount,
    });
    setStep(2);
  };

  const handleSkipAI = async () => {
    await updateProfile({
      displayName: displayName.trim() || "冒險者",
      onboardingDone: true,
    });
    router.push("/");
  };

  const finish = async () => {
    await updateProfile({ onboardingDone: true });
    router.push("/");
  };

  return (
    <div className="adventure-world min-h-screen flex items-center justify-center p-4">
      <div className="adventure-content w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <p className="text-3xl mb-2 float-gentle">🗡️</p>
          <h1 className="game-banner-title leading-relaxed">人生冒險遊戲</h1>
          <p className="font-body text-lg text-[var(--pixel-text-muted)] mt-2">
            把人生目標，變成能完成的日常
          </p>
        </div>

        {step === 0 && (
          <PixelCard title="歡迎，冒險者！" accent>
            <p className="font-body text-base text-[var(--pixel-text-muted)] mb-4">
              在開始冒險之前，告訴我們你的名字，並生成你的像素角色（之後還可換頭像 2 次）。
            </p>
            <PixelInput
              label="冒險者名稱"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="你的名字"
            />
            <PixelButton
              onClick={() => setStep(1)}
              className="w-full mt-4"
              disabled={!displayName.trim()}
            >
              下一步 →
            </PixelButton>
          </PixelCard>
        )}

        {step === 1 && (
          <PixelCard title="選擇角色風格" accent>
            {hasAvatar && remainingChanges <= 0 ? (
              <div className="text-center py-4">
                <AdventureAvatar
                  src={profile!.aiCharacterUrl!}
                  alt="已有角色"
                  size="md"
                  className="mx-auto"
                />
                <p className="font-body text-lg text-[var(--pixel-text-muted)] mt-3">
                  角色已生成，換頭像次數已用完
                </p>
                <PixelButton onClick={finish} className="w-full mt-4">
                  開始冒險
                </PixelButton>
              </div>
            ) : hasAvatar && remainingChanges > 0 ? (
              <div className="text-center py-4 space-y-4">
                <AdventureAvatar
                  src={profile!.aiCharacterUrl!}
                  alt="已有角色"
                  size="md"
                  className="mx-auto"
                />
                <p className="font-body text-lg text-[var(--pixel-text-muted)]">
                  角色已生成，可直接開始冒險
                </p>
                <PixelButton onClick={finish} className="w-full">
                  開始冒險
                </PixelButton>
              </div>
            ) : (
              <AvatarGenerator
                displayName={displayName}
                avatarGenerationCount={profile?.avatarGenerationCount}
                aiCharacterUrl={profile?.aiCharacterUrl}
                remainingChanges={remainingChanges}
                onSuccess={handleSuccess}
                onSkip={handleSkipAI}
              />
            )}
          </PixelCard>
        )}

        {step === 2 && characterUrl && (
          <PixelCard title="角色覺醒！" accent>
            <div className="flex flex-col items-center gap-4 py-4">
              <AdventureAvatar src={characterUrl} alt="你的角色" size="lg" />
              <p className="text-display text-[var(--pixel-accent)]">{displayName}</p>
              <p className="font-body text-lg text-[var(--pixel-text-muted)] text-center">
                你的像素冒險者已覺醒！從今天起，把人生目標變成能完成的日常。
              </p>
              <PixelButton onClick={finish} className="w-full" size="lg">
                開始冒險 ⚔️
              </PixelButton>
            </div>
          </PixelCard>
        )}
      </div>
    </div>
  );
}
