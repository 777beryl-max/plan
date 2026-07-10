"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** 頂部列按鈕：設定、同步、登出共用同一尺寸（隨螢幕寬度縮放） */
export const HEADER_ACTION_BTN =
  "pixel-btn font-body font-bold bg-[var(--pixel-surface)] text-[var(--pixel-text)] border-2 border-[var(--pixel-border-soft)] hover:bg-[var(--pixel-surface-2)] px-1.5 py-1 text-[11px] rounded-[7px] min-w-[1.75rem] h-7 sm:border-[3px] sm:px-3.5 sm:py-2 sm:text-sm sm:rounded-[10px] sm:min-w-[5.25rem] sm:h-10 inline-flex items-center justify-center shrink-0 whitespace-nowrap";

export function HeaderActionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={HEADER_ACTION_BTN}>
      {children}
    </Link>
  );
}

export function HeaderActionButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${HEADER_ACTION_BTN} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
