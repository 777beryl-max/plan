"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary:
    "bg-gradient-to-b from-[#ffe566] to-[var(--pixel-accent)] text-[var(--pixel-border)]",
  secondary:
    "bg-gradient-to-b from-[#8ee8e0] to-[var(--pixel-mp)] text-[var(--pixel-border)]",
  danger:
    "bg-gradient-to-b from-[#ff9b9b] to-[var(--pixel-danger)] text-white",
  ghost:
    "bg-[var(--pixel-surface)] text-[var(--pixel-text)] border-[3px] border-[var(--pixel-border-soft)] hover:bg-[var(--pixel-surface-2)]",
};

const sizes = {
  sm: "px-3.5 py-2 text-sm rounded-[10px]",
  md: "px-5 py-2.5 text-base rounded-[12px]",
  lg: "px-6 py-3.5 text-lg rounded-[14px]",
};

export function PixelButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={`pixel-btn font-body font-bold inline-flex items-center justify-center text-center ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
