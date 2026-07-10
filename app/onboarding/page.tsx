"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { CHARACTER_STYLES, CHARACTER_GENDERS, type CharacterStyle, type CharacterGender } from "@/lib/types";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";
import {
  ReferenceImageUpload,
  type ReferenceImageData,
} from "@/components/onboarding/ReferenceImageUpload";
import { getDeviceId } from "@/lib/device-id";

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [style, setStyle] = useState<CharacterStyle>("brave");
  const [gender, setGender] = useState<CharacterGender>("neutral");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<ReferenceImageData | null>(null);

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

  const handleGenerate = async () => {
    if (!displayName.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/ai/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(deviceId ? { "x-device-id": deviceId } : {}),
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
          style,
          gender,
          ...(referenceImage
            ? {
                referenceImageBase64: referenceImage.base64,
                referenceImageMimeType: referenceImage.mimeType,
              }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "生成失敗");
      }

      setCharacterUrl(data.url);
      await updateProfile({
        displayName: displayName.trim(),
        aiCharacterUrl: data.url,
        aiGeneratedAt: new Date().toISOString(),
        characterStyle: style,
        characterGender: gender,
      });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失敗，請稍後再試");
    } finally {
      setGenerating(false);
    }
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
          <h1 className="game-banner-title font-pixel text-sm leading-relaxed">
            人生冒險遊戲
          </h1>
          <p className="font-body text-lg text-[var(--pixel-text-muted)] mt-2">
            把人生目標，變成能完成的日常
          </p>
        </div>

        {step === 0 && (
          <PixelCard title="歡迎，冒險者！" accent>
            <p className="font-body text-base text-[var(--pixel-text-muted)] mb-4">
              在開始冒險之前，告訴我們你的名字，並生成你的像素角色（僅此一次）。
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
            {profile?.aiCharacterUrl ? (
              <div className="text-center py-4">
                <img
                  src={profile.aiCharacterUrl}
                  alt="已有角色"
                  className="w-24 h-24 border-4 border-[var(--pixel-accent)] mx-auto"
                  style={{ imageRendering: "pixelated" }}
                />
                <p className="font-body text-lg text-[var(--pixel-text-muted)] mt-3">
                  角色已生成，不可重複生成
                </p>
                <PixelButton onClick={finish} className="w-full mt-4">
                  開始冒險
                </PixelButton>
              </div>
            ) : (
              <>
            <p className="font-body text-base text-[var(--pixel-text-muted)] mb-3">
              為你生成獨特的像素冒險者（僅首次生成）
            </p>

            <p className="text-label text-[var(--pixel-accent)] mb-2">性別</p>
            <div className="flex gap-2 mb-4">
              {CHARACTER_GENDERS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  className={`flex-1 border-4 py-2 font-body text-lg transition-colors ${
                    gender === g.id
                      ? "border-[var(--pixel-accent)] bg-[var(--pixel-accent)]/10 text-[var(--pixel-accent)]"
                      : "border-[var(--pixel-border)] bg-[var(--pixel-bg)] text-[var(--pixel-text-muted)]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <p className="text-label text-[var(--pixel-accent)] mb-2">風格</p>
            <div className="space-y-2 mb-4">
              {CHARACTER_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`w-full text-left border-4 p-3 transition-colors ${
                    style === s.id
                      ? "border-[var(--pixel-accent)] bg-[var(--pixel-accent)]/10"
                      : "border-[var(--pixel-border)] bg-[var(--pixel-bg)]"
                  }`}
                >
                  <span className="text-label text-[var(--pixel-accent)]">
                    {s.label}
                  </span>
                  <p className="font-body text-base text-[var(--pixel-text-muted)]">{s.desc}</p>
                </button>
              ))}
            </div>

            <ReferenceImageUpload
              value={referenceImage}
              onChange={setReferenceImage}
              onError={setError}
            />

            {error && (
              <div className="border-4 border-[var(--pixel-hp)] p-2 mb-3 font-body text-base text-[var(--pixel-hp)]">
                {error}
              </div>
            )}

            <PixelButton
              onClick={handleGenerate}
              className="w-full"
              disabled={generating}
            >
              {generating
                ? referenceImage
                  ? "分析參考圖並生成中..."
                  : "生成中..."
                : "✨ 生成我的角色"}
            </PixelButton>
            <PixelButton
              variant="ghost"
              onClick={handleSkipAI}
              className="w-full mt-2"
            >
              暫時跳過
            </PixelButton>
              </>
            )}
          </PixelCard>
        )}

        {step === 2 && characterUrl && (
          <PixelCard title="角色覺醒！" accent>
            <div className="flex flex-col items-center gap-4 py-4">
              <img
                src={characterUrl}
                alt="你的角色"
                className="w-32 h-32 border-4 border-[var(--pixel-accent)]"
                style={{ imageRendering: "pixelated" }}
              />
              <p className="font-pixel text-sm text-[var(--pixel-accent)]">
                {displayName}
              </p>
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
