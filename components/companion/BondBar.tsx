import { getBondProgress } from "@/lib/companion/bond";

interface BondBarProps {
  bondXp: number;
}

export function BondBar({ bondXp }: BondBarProps) {
  const { level, currentXp, xpForNextLevel, progressPercent } = getBondProgress(bondXp);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-label text-[var(--pixel-accent)]">好感 Lv.{level}</span>
        <span className="font-body text-sm text-[var(--pixel-text-muted)]">
          {xpForNextLevel === null ? "已達最高" : `${currentXp} / ${xpForNextLevel}`}
        </span>
      </div>
      <div className="h-3 rounded-full border-2 border-[var(--pixel-border)] bg-white overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ffb3c6] to-[var(--pixel-accent)] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
