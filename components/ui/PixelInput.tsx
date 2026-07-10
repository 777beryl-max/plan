"use client";

import { type InputHTMLAttributes } from "react";

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PixelInput({ label, className = "", ...props }: PixelInputProps) {
  return (
    <label className="flex flex-col gap-2 w-full">
      {label && (
        <span className="text-label text-[var(--pixel-accent)]">{label}</span>
      )}
      <input
        className={`pixel-input w-full bg-white border-[3px] border-[var(--pixel-border-soft)] px-4 py-3 text-[var(--pixel-text)] font-body text-lg focus:outline-none focus:border-[var(--pixel-accent)] rounded-[10px] ${className}`}
        {...props}
      />
    </label>
  );
}
