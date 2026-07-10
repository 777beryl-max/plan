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
    <nav className="game-nav fixed bottom-0 left-0 right-0 z-40 px-2 pt-2 pb-3">
      <div className="flex max-w-2xl mx-auto gap-1 px-1 pb-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`game-nav-item flex-1 flex flex-col items-center py-2 gap-0.5 ${
                active ? "active" : "text-[var(--pixel-text-muted)]"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-label text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
