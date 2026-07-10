import { getAdventurerProgress } from "@/lib/adventurer/levels";

interface AdventurerXpBarProps {
  adventurerXp: number;
}

export function AdventurerXpBar({ adventurerXp }: AdventurerXpBarProps) {
  const { level, currentXp, xpForNextLevel, progressPercent } =
    getAdventurerProgress(adventurerXp);

  return (
    <div className="w-full mt-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-label text-[var(--pixel-gold-dark)]">經驗值 Lv.{level}</span>
        <span className="font-body text-sm text-[var(--pixel-text-muted)]">
          {xpForNextLevel === null ? "傳奇冒險者" : `${currentXp} / ${xpForNextLevel} EXP`}
        </span>
      </div>
      <div className="h-3 rounded-full border-2 border-[var(--pixel-border)] bg-white overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ffe566] to-[var(--pixel-accent)] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
