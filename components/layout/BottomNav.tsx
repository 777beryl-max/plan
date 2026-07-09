"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "基地", icon: "🏠" },
  { href: "/goals", label: "目標", icon: "⚔️" },
  { href: "/plan", label: "計畫", icon: "📜" },
  { href: "/focus", label: "專注", icon: "⏱️" },
  { href: "/achievements", label: "戰報", icon: "🏆" },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-[var(--pixel-border)] bg-[var(--pixel-surface)]">
      <div className="flex max-w-2xl mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
                active
                  ? "text-[var(--pixel-accent)] bg-[var(--pixel-bg)]"
                  : "text-[var(--pixel-text-muted)] hover:text-[var(--pixel-text)]"
              }`}
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <span className="text-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
