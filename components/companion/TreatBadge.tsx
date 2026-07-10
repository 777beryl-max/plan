import { getTreatLabel } from "@/lib/companion/treats";
import type { CompanionSpecies } from "@/lib/types";

interface TreatBadgeProps {
  count: number;
  species: CompanionSpecies;
  size?: "xs" | "sm" | "md";
}

export function TreatBadge({ count, species, size = "md" }: TreatBadgeProps) {
  const label = getTreatLabel(species);
  const sizeClass =
    size === "xs"
      ? "text-xs px-2 py-0.5 gap-1"
      : size === "sm"
        ? "text-xs px-2.5 py-1 gap-1"
        : "text-base px-3 py-1.5 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-[var(--pixel-gold-dark)] bg-gradient-to-b from-[#fff6c8] to-[var(--pixel-gold)] text-[var(--pixel-border)] font-body font-bold leading-none ${sizeClass}`}
    >
      <span aria-hidden>🍖</span>
      <span>
        {label} x{count}
      </span>
    </span>
  );
}
