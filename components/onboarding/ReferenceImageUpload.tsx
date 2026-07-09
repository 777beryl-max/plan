"use client";

import { useRef } from "react";
import { PixelButton } from "@/components/ui/PixelButton";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface ReferenceImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
  fileName: string;
}

interface ReferenceImageUploadProps {
  value: ReferenceImageData | null;
  onChange: (value: ReferenceImageData | null) => void;
  onError: (message: string) => void;
}

export function ReferenceImageUpload({
  value,
  onChange,
  onError,
}: ReferenceImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError("僅支援 JPG、PNG、WebP、GIF 格式");
      return;
    }
    if (file.size > MAX_BYTES) {
      onError("參考圖片不能超過 4MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) {
        onError("圖片讀取失敗");
        return;
      }
      onChange({
        base64,
        mimeType: file.type,
        previewUrl: result,
        fileName: file.name,
      });
      onError("");
    };
    reader.onerror = () => onError("圖片讀取失敗");
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-4">
      <p className="text-label text-[var(--pixel-accent)] mb-2">參考圖片（選填）</p>
      <p className="font-body text-base text-[var(--pixel-text-muted)] mb-2">
        上傳參考圖片(支援 JPG / PNG / GIF，最大 4MB)
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg)] p-3">
          <div className="flex items-center gap-3">
            <img
              src={value.previewUrl}
              alt="參考圖片預覽"
              className="w-16 h-16 border-2 border-[var(--pixel-accent)] object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-body text-base text-[var(--pixel-text)] truncate">
                {value.fileName}
              </p>
              <p className="font-body text-base text-[var(--pixel-success)] mt-1">
                已選擇參考圖
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <PixelButton
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => inputRef.current?.click()}
            >
              更換圖片
            </PixelButton>
            <PixelButton
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => onChange(null)}
            >
              移除
            </PixelButton>
          </div>
        </div>
      ) : (
        <PixelButton
          variant="secondary"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          📷 上傳參考圖片
        </PixelButton>
      )}
    </div>
  );
}
