"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary: "bg-[var(--pixel-accent)] text-[var(--pixel-border)] hover:brightness-110",
  secondary: "bg-[var(--pixel-mp)] text-white hover:brightness-110",
  danger: "bg-[var(--pixel-hp)] text-white hover:brightness-110",
  ghost: "bg-transparent text-[var(--pixel-text)] border-2 border-[var(--pixel-border)] hover:bg-[var(--pixel-surface)]",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3.5 text-lg",
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
      className={`pixel-btn font-pixel ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
