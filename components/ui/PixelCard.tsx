"use client";

import { type ReactNode } from "react";

interface PixelCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  accent?: boolean;
}

export function PixelCard({ title, children, className = "", accent }: PixelCardProps) {
  return (
    <div
      className={`pixel-card border-[3px] border-[var(--pixel-border)] p-5 ${
        accent ? "pixel-card-accent border-[var(--pixel-gold-dark)]" : ""
      } ${className}`}
    >
      {title && (
        <div className="pixel-card-header">
          <h3 className="text-display text-[var(--pixel-accent)] flex-1">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
