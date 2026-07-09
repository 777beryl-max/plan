"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";

const BARE_PATHS = ["/onboarding", "/login"];

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE_PATHS.includes(pathname)) {
    return <>{children}</>;
  }
  return <AppShell>{children}</AppShell>;
}
