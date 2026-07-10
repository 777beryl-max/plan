"use client";

interface PixelTabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}

export function PixelTabs<T extends string>({ tabs, active, onChange }: PixelTabsProps<T>) {
  return (
    <div className="flex gap-1 border-[3px] border-[var(--pixel-border-soft)] p-1 bg-white/70 rounded-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 text-label py-2.5 px-2 rounded-xl transition-all ${
            active === tab.id
              ? "bg-gradient-to-b from-[#ffe566] to-[var(--pixel-accent)] text-[var(--pixel-border)] shadow-sm"
              : "text-[var(--pixel-text-muted)] hover:text-[var(--pixel-text)] hover:bg-white/50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
