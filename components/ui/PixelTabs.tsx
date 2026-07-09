"use client";

interface PixelTabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}

export function PixelTabs<T extends string>({ tabs, active, onChange }: PixelTabsProps<T>) {
  return (
    <div className="flex gap-1 border-4 border-[var(--pixel-border)] p-1 bg-[var(--pixel-bg)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 text-label py-3 px-2 transition-colors ${
            active === tab.id
              ? "bg-[var(--pixel-accent)] text-[var(--pixel-border)]"
              : "text-[var(--pixel-text-muted)] hover:text-[var(--pixel-text)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
