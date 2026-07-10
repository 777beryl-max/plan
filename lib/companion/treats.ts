import type { CompanionSpecies } from "@/lib/types";

export const TREAT_LABELS: Record<CompanionSpecies, string> = {
  dog: "狗糧",
  cat: "貓罐頭",
  fox: "小魚乾",
  rabbit: "胡蘿蔔丁",
  bear: "蜂蜜球",
  owl: "堅果粒",
};

export function getTreatLabel(species: CompanionSpecies): string {
  return TREAT_LABELS[species];
}
