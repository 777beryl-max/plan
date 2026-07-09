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
      className={`pixel-card bg-[var(--pixel-surface)] border-4 border-[var(--pixel-border)] p-5 ${
        accent ? "border-[var(--pixel-accent)]" : ""
      } ${className}`}
    >
      {title && (
        <h3 className="font-pixel text-lg text-[var(--pixel-accent)] mb-4 leading-relaxed">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
