"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";
import type { WeeklyReport } from "@/lib/types";
import { getCompletionRate, formatWeekDateRange, getShareText } from "@/lib/weekly-report";
import { ProgressChart } from "./ProgressChart";
import { useAppStore } from "@/stores/appStore";
import { useCompanionStore } from "@/stores/companionStore";
import { COMPANION_IMAGE_SRC, COMPANION_IMAGE_LABEL } from "@/lib/companion/companion-images";
import { capturePosterPng } from "@/lib/poster/capture";
import { copyPosterPngToClipboard, sharePosterPng } from "@/lib/poster/share";
import {
  POSTER_COLORS,
  POSTER_CHARACTER_SIZE,
  POSTER_FRAME_RADIUS,
  POSTER_FRAME_SHADOW,
} from "@/lib/poster/colors";
import {
  POSTER_CHARACTER_IMAGE_STYLE,
  POSTER_CHAR_COLUMN_WIDTH,
  POSTER_MEDAL_COLUMN_WIDTH,
  POSTER_MEDAL_FACE_STYLE,
  POSTER_MEDAL_SHADOW,
  POSTER_PIXEL_FRAME_FACE_STYLE,
  posterPixelFrameShadowStyle,
  posterPixelFrameShellStyle,
} from "@/lib/poster/frame";
import {
  POSTER_TEXT_CENTER,
  POSTER_MEDAL_SIZE,
  posterWeekBadgeStyle,
  posterRoleBadgeStyle,
  posterNameStyle,
  posterStatPillContentStyle,
  posterStatPillLabelStyle,
  POSTER_SQUAD_STYLE,
  posterSquadColumnStyle,
  POSTER_MEDAL_RATE_STYLE,
  POSTER_MEDAL_LABEL_STYLE,
  posterGoalRowStyle,
  posterGoalTitleStyle,
  posterGoalScoreStyle,
} from "@/lib/poster/layout";

interface WeeklyPosterProps {
  report: WeeklyReport;
  onDownload?: () => void;
}

function PosterStatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "mp" | "success";
}) {
  const toneStyle = {
    accent: {
      background: POSTER_COLORS.statAccent,
      color: POSTER_COLORS.accent,
      borderColor: POSTER_COLORS.goldDark,
    },
    mp: {
      background: POSTER_COLORS.statMp,
      color: POSTER_COLORS.mp,
      borderColor: POSTER_COLORS.mp,
    },
    success: {
      background: POSTER_COLORS.statSuccess,
      color: POSTER_COLORS.success,
      borderColor: POSTER_COLORS.success,
    },
  }[tone];

  return (
    <div
      style={{
        ...toneStyle,
        borderWidth: 3,
        borderStyle: "solid",
        borderRadius: 16,
        padding: "12px 8px",
        textAlign: "center",
      }}
    >
      <p style={posterStatPillContentStyle()}>{value}</p>
      <p style={posterStatPillLabelStyle()}>{label}</p>
    </div>
  );
}

function PosterPill({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <div data-poster-pill style={style}>
      {label}
    </div>
  );
}

function PosterCharacterFrame({
  src,
  alt,
  fallback,
}: {
  src?: string;
  alt: string;
  fallback: string;
}) {
  const shellStyle = posterPixelFrameShellStyle(
    POSTER_CHAR_COLUMN_WIDTH,
    POSTER_CHARACTER_SIZE + POSTER_FRAME_SHADOW.y
  );

  return (
    <div data-poster-frame style={shellStyle}>
      <div
        aria-hidden
        style={posterPixelFrameShadowStyle(POSTER_CHARACTER_SIZE, POSTER_FRAME_RADIUS)}
      />
      <div style={POSTER_PIXEL_FRAME_FACE_STYLE}>
        {src ? (
          <img
            data-poster-char
            data-poster-src={src}
            src={src}
            alt={alt}
            style={POSTER_CHARACTER_IMAGE_STYLE}
          />
        ) : (
          <div
            style={{
              display: "table",
              width: "100%",
              height: "100%",
              background: POSTER_COLORS.frameGradient,
            }}
          >
            <div
              style={{
                display: "table-cell",
                verticalAlign: "middle",
                textAlign: "center",
                fontSize: 32,
                lineHeight: "36px",
              }}
            >
              {fallback}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareSheet({
  open,
  onClose,
  onNativeShare,
  onCopyImage,
  onCopyText,
  onDownloadImage,
  sharing,
}: {
  open: boolean;
  onClose: () => void;
  onNativeShare: () => void;
  onCopyImage: () => void;
  onCopyText: () => void;
  onDownloadImage: () => void;
  sharing: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border-4 border-[var(--pixel-border)] bg-[var(--pixel-surface)] p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="share-sheet-title"
      >
        <h3 id="share-sheet-title" className="text-label mb-1 text-center">
          分享週冒險戰報
        </h3>
        <p className="mb-3 text-center font-body text-sm text-[var(--pixel-text-muted)]">
          以 PNG 圖片分享到 LINE、訊息等 App
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={onNativeShare}
            disabled={sharing}
            className="pixel-btn w-full border-4 border-[var(--pixel-border)] bg-[var(--pixel-mp)] px-4 py-3 text-label text-white disabled:opacity-60"
          >
            {sharing ? "準備中..." : "分享戰報到其他 App"}
          </button>
          <button
            type="button"
            onClick={onCopyImage}
            className="pixel-btn w-full border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg)] px-4 py-3 text-label text-[var(--pixel-text)]"
          >
            複製 PNG 到剪貼簿
          </button>
          <button
            type="button"
            onClick={onCopyText}
            className="pixel-btn w-full border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg)] px-4 py-3 text-label text-[var(--pixel-text)]"
          >
            複製戰報文字
          </button>
          <button
            type="button"
            onClick={onDownloadImage}
            className="pixel-btn w-full border-4 border-[var(--pixel-border)] bg-[var(--pixel-accent)] px-4 py-3 text-label text-[var(--pixel-border)]"
          >
            下載戰報圖片
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 font-body text-sm text-[var(--pixel-text-muted)]"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

export function WeeklyPoster({ report }: WeeklyPosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const shareBlobRef = useRef<Blob | null>(null);
  const profile = useAppStore((s) => s.profile);
  const companion = useCompanionStore((s) => s.companion);
  const displayName = profile?.displayName ?? "冒險者";
  const rate = getCompletionRate(report.plannedCount, report.completedCount);
  const [sharing, setSharing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const posterFilename = `bullet-plan-week${report.week}-poster.png`;

  useEffect(() => {
    shareBlobRef.current = null;
  }, [profile?.aiCharacterUrl, companion?.species, companion?.name, report.id]);

  const ensurePosterBlob = async () => {
    if (shareBlobRef.current) return shareBlobRef.current;
    if (!posterRef.current) throw new Error("戰報尚未準備好");
    const blob = await capturePosterPng(posterRef.current);
    shareBlobRef.current = blob;
    return blob;
  };

  const downloadBlob = (blob: Blob) => {
    const link = document.createElement("a");
    link.download = posterFilename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setSharing(true);
    try {
      const blob = await ensurePosterBlob();
      downloadBlob(blob);
    } finally {
      setSharing(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const blob = await ensurePosterBlob();
      const result = await sharePosterPng(blob, posterFilename, report);
      if (result === "shared") return;
      if (result === "cancelled") return;
      setShareOpen(true);
    } catch {
      setShareOpen(true);
    } finally {
      setSharing(false);
    }
  };

  const handleSheetNativeShare = async () => {
    setSharing(true);
    try {
      const blob = await ensurePosterBlob();
      const result = await sharePosterPng(blob, posterFilename, report);
      if (result === "shared") {
        setShareOpen(false);
        return;
      }
      if (result === "cancelled") return;
      alert("此裝置無法開啟系統分享，請改用複製圖片或下載戰報。");
    } catch {
      alert("分享失敗，請改用複製圖片或下載戰報。");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyImage = async () => {
    const blob = await ensurePosterBlob();
    const copied = await copyPosterPngToClipboard(blob);
    if (copied) {
      alert("戰報 PNG 已複製！可貼到 LINE、訊息或其他 App。");
      setShareOpen(false);
      return;
    }
    alert("此瀏覽器無法複製圖片，請改用「分享戰報」或下載圖片。");
  };

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(getShareText(report));
    alert("戰報文字已複製到剪貼簿！");
    setShareOpen(false);
  };

  const handleSheetDownload = async () => {
    const blob = await ensurePosterBlob();
    downloadBlob(blob);
    setShareOpen(false);
  };

  return (
    <div className="space-y-3">
      <div
        ref={posterRef}
        className="weekly-poster"
        style={{
          borderRadius: 24,
          border: `3px solid ${POSTER_COLORS.goldDark}`,
          padding: 24,
          borderColor: POSTER_COLORS.goldDark,
          background: POSTER_COLORS.posterGradient,
          overflow: "visible",
        }}
      >
        <div style={{ ...POSTER_TEXT_CENTER, marginBottom: 20, position: "relative" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 8,
              top: 0,
              fontSize: 18,
              color: "rgba(74, 55, 40, 0.45)",
            }}
          >
            ✨
          </span>
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: 8,
              top: 4,
              fontSize: 16,
              color: "rgba(74, 55, 40, 0.35)",
            }}
          >
            ⭐
          </span>
          <PosterPill
            label={`第 ${report.week} 週`}
            style={posterWeekBadgeStyle()}
          />
          <p
            style={{
              ...POSTER_TEXT_CENTER,
              marginTop: 12,
              fontSize: 14,
              fontWeight: 700,
              color: POSTER_COLORS.accent,
            }}
          >
            人生冒險遊戲
          </p>
          <h2
            style={{
              ...POSTER_TEXT_CENTER,
              marginTop: 4,
              fontSize: 20,
              fontWeight: 700,
              color: POSTER_COLORS.text,
            }}
          >
            週冒險戰報
          </h2>
          <p
            style={{
              ...POSTER_TEXT_CENTER,
              marginTop: 6,
              fontSize: 14,
              fontWeight: 500,
              color: POSTER_COLORS.textMuted,
            }}
          >
            {formatWeekDateRange(report.year, report.week)}
          </p>
        </div>

        <div
          style={{
            position: "relative",
            marginBottom: 20,
            borderRadius: 16,
            border: `3px dashed ${POSTER_COLORS.goldDark}`,
            backgroundColor: POSTER_COLORS.panelBg,
            boxShadow: "inset 0 2px 0 rgba(255, 255, 255, 0.8)",
            padding: "16px 12px 28px",
            overflow: "visible",
          }}
        >
          <p
            style={{
              ...POSTER_TEXT_CENTER,
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 700,
              color: POSTER_COLORS.accent,
            }}
          >
            🏠 本週冒險小隊
          </p>

          <div style={{ textAlign: "center" }}>
            <div className="weekly-poster-squad" data-poster-squad style={POSTER_SQUAD_STYLE}>
              <div style={posterSquadColumnStyle(POSTER_CHAR_COLUMN_WIDTH)}>
                <PosterPill label="隊長" style={posterRoleBadgeStyle("leader")} />
              <PosterCharacterFrame
                src={profile?.aiCharacterUrl}
                alt="冒險角色"
                fallback="🧙"
              />
              <p data-poster-name style={posterNameStyle()}>
                {displayName}
              </p>
            </div>

            <div style={posterSquadColumnStyle(POSTER_MEDAL_COLUMN_WIDTH)}>
              <div
                data-poster-medal
                style={posterPixelFrameShellStyle(
                  POSTER_MEDAL_COLUMN_WIDTH,
                  POSTER_MEDAL_SIZE + POSTER_MEDAL_SHADOW.y
                )}
              >
                <div
                  aria-hidden
                  style={posterPixelFrameShadowStyle(
                    POSTER_MEDAL_SIZE,
                    "50%",
                    POSTER_MEDAL_SHADOW.x,
                    POSTER_MEDAL_SHADOW.y
                  )}
                />
                <div style={POSTER_MEDAL_FACE_STYLE}>
                  <div data-poster-medal-line="rate" style={POSTER_MEDAL_RATE_STYLE}>
                    {rate}%
                  </div>
                  <div data-poster-medal-line="label" style={POSTER_MEDAL_LABEL_STYLE}>
                    完成率
                  </div>
                </div>
              </div>
              <span style={{ display: "block", marginTop: 4, fontSize: 12 }} aria-hidden>
                🎖️
              </span>
            </div>

            <div style={posterSquadColumnStyle(POSTER_CHAR_COLUMN_WIDTH)}>
              <PosterPill label="夥伴" style={posterRoleBadgeStyle("partner")} />
              <PosterCharacterFrame
                src={companion ? COMPANION_IMAGE_SRC[companion.species] : undefined}
                alt={companion ? COMPANION_IMAGE_LABEL[companion.species] : "夥伴"}
                fallback="🐾"
              />
              <p data-poster-name style={posterNameStyle()}>
                {companion?.name ?? "尚未結伴"}
              </p>
            </div>
          </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            textAlign: "center",
          }}
        >
          <PosterStatPill label="完成" value={report.completedCount} tone="accent" />
          <PosterStatPill label="預計" value={report.plannedCount} tone="mp" />
          <PosterStatPill label="專注分" value={report.focusMinutes} tone="success" />
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 16,
            border: `3px solid ${POSTER_COLORS.borderSoft}`,
            padding: 12,
            borderColor: POSTER_COLORS.borderSoft,
            backgroundColor: POSTER_COLORS.chartBg,
          }}
        >
          <ProgressChart planned={report.plannedCount} completed={report.completedCount} />
        </div>

        {report.goalStats.length > 0 && (
          <div
            style={{
              marginTop: 16,
              borderRadius: 16,
              border: `3px solid ${POSTER_COLORS.borderSoft}`,
              padding: "12px 12px",
              borderColor: POSTER_COLORS.borderSoft,
              backgroundColor: POSTER_COLORS.goalsBg,
            }}
          >
            <p
              style={{
                ...POSTER_TEXT_CENTER,
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 700,
                color: POSTER_COLORS.textMuted,
              }}
            >
              ⚔️ 各目標戰績
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {report.goalStats.map((g) => (
                <li
                  key={g.goalId}
                  style={{
                    marginBottom: 6,
                    borderRadius: 12,
                    border: `2px solid ${POSTER_COLORS.borderSoft}`,
                    backgroundColor: POSTER_COLORS.goalItemBg,
                    padding: "8px 10px 8px 12px",
                  }}
                >
                  <div data-poster-goal-row style={posterGoalRowStyle()}>
                    <span data-poster-goal-title style={posterGoalTitleStyle()}>
                      {g.goalTitle}
                    </span>
                    <span data-poster-goal-score style={posterGoalScoreStyle()}>
                      {g.completed}/{g.planned}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p
          style={{
            ...POSTER_TEXT_CENTER,
            marginTop: 16,
            fontSize: 14,
            fontWeight: 500,
            color: POSTER_COLORS.textMuted,
          }}
        >
          把人生目標，變成能完成的日常 ✨
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={sharing}
          className="pixel-btn flex-1 border-4 border-[var(--pixel-border)] bg-[var(--pixel-accent)] px-4 py-2 text-label text-[var(--pixel-border)] disabled:opacity-60"
        >
          {sharing ? "準備中..." : "下載 PNG"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="pixel-btn flex-1 border-4 border-[var(--pixel-border)] bg-[var(--pixel-mp)] px-4 py-2 text-label text-white disabled:opacity-60"
        >
          {sharing ? "準備中..." : "分享戰報"}
        </button>
      </div>

      <ShareSheet
        open={shareOpen}
        sharing={sharing}
        onClose={() => setShareOpen(false)}
        onNativeShare={handleSheetNativeShare}
        onCopyImage={handleCopyImage}
        onCopyText={handleCopyText}
        onDownloadImage={handleSheetDownload}
      />
    </div>
  );
}
