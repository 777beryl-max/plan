"use client";

import { useState } from "react";
import {
  CHARACTER_STYLES,
  CHARACTER_GENDERS,
  type CharacterStyle,
  type CharacterGender,
} from "@/lib/types";
import { PixelButton } from "@/components/ui/PixelButton";
import {
  ReferenceImageUpload,
  type ReferenceImageData,
} from "@/components/onboarding/ReferenceImageUpload";
import { getDeviceId } from "@/lib/device-id";
import { effectiveAvatarGenerationCount } from "@/lib/avatar/limits";

interface AvatarGeneratorProps {
  displayName: string;
  avatarGenerationCount?: number;
  aiCharacterUrl?: string;
  initialStyle?: CharacterStyle;
  initialGender?: CharacterGender;
  remainingChanges: number;
  onSuccess: (data: {
    url: string;
    style: CharacterStyle;
    gender: CharacterGender;
    avatarGenerationCount: number;
    remainingChanges: number;
  }) => void | Promise<void>;
  onSkip?: () => void;
  skipLabel?: string;
}

export function AvatarGenerator({
  displayName,
  avatarGenerationCount,
  aiCharacterUrl,
  initialStyle = "brave",
  initialGender = "neutral",
  remainingChanges,
  onSuccess,
  onSkip,
  skipLabel = "暫時跳過",
}: AvatarGeneratorProps) {
  const [style, setStyle] = useState<CharacterStyle>(initialStyle);
  const [gender, setGender] = useState<CharacterGender>(initialGender);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<ReferenceImageData | null>(null);

  const handleGenerate = async () => {
    if (!displayName.trim() || remainingChanges <= 0) return;
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
          avatarGenerationCount: effectiveAvatarGenerationCount({
            avatarGenerationCount,
            aiCharacterUrl,
          }),
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

      await onSuccess({
        url: data.url,
        style: data.style,
        gender: data.gender,
        avatarGenerationCount: data.avatarGenerationCount,
        remainingChanges: data.remainingChanges,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失敗，請稍後再試");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <p className="font-body text-base text-[var(--pixel-text-muted)] mb-3">
        生成可愛冒險風格角色，與夥伴、基地畫面一致
        {remainingChanges > 0 && (
          <span className="block mt-1 text-[var(--pixel-accent)]">
            還可換頭像 {remainingChanges} 次
          </span>
        )}
      </p>

      <p className="text-label text-[var(--pixel-accent)] mb-2">性別</p>
      <div className="flex gap-2 mb-4">
        {CHARACTER_GENDERS.map((g) => (
          <button
            key={g.id}
            type="button"
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
            type="button"
            onClick={() => setStyle(s.id)}
            className={`w-full text-left border-4 p-3 transition-colors ${
              style === s.id
                ? "border-[var(--pixel-accent)] bg-[var(--pixel-accent)]/10"
                : "border-[var(--pixel-border)] bg-[var(--pixel-bg)]"
            }`}
          >
            <span className="text-label text-[var(--pixel-accent)]">{s.label}</span>
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
        disabled={generating || remainingChanges <= 0}
      >
        {generating
          ? referenceImage
            ? "分析參考圖並生成中..."
            : "生成中..."
          : "✨ 生成我的角色"}
      </PixelButton>

      {onSkip && (
        <PixelButton variant="ghost" onClick={onSkip} className="w-full mt-2">
          {skipLabel}
        </PixelButton>
      )}
    </>
  );
}
