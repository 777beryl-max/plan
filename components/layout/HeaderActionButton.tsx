"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** 頂部列按鈕：設定、同步、登出共用同一尺寸 */
export const HEADER_ACTION_BTN =
  "pixel-btn font-body font-bold bg-[var(--pixel-surface)] text-[var(--pixel-text)] border-[3px] border-[var(--pixel-border-soft)] hover:bg-[var(--pixel-surface-2)] px-3.5 py-2 text-sm rounded-[10px] min-w-[5.25rem] h-10 inline-flex items-center justify-center shrink-0";

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
