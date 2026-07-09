"use client";

import { type ReactNode, useEffect } from "react";
import { PixelButton } from "./PixelButton";

interface PixelModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function PixelModal({ open, onClose, title, children }: PixelModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative pixel-card bg-[var(--pixel-surface)] border-4 border-[var(--pixel-accent)] p-6 w-full max-w-md z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-display text-[var(--pixel-accent)]">{title}</h2>
          <PixelButton variant="ghost" size="sm" onClick={onClose}>
            ✕
          </PixelButton>
        </div>
        {children}
      </div>
    </div>
  );
}
