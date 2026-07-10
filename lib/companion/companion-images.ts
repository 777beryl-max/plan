import type { CompanionSpecies } from "@/lib/types";

/** 夥伴立繪圖片路徑（public/images） */
export const COMPANION_IMAGE_SRC: Record<CompanionSpecies, string> = {
  cat: "/images/cat.png",
  dog: "/images/dog.png",
  fox: "/images/fox.png",
  rabbit: "/images/rabbit.png",
  bear: "/images/bear.png",
  owl: "/images/owl.png",
};

export const COMPANION_IMAGE_LABEL: Record<CompanionSpecies, string> = {
  cat: "貓咪夥伴",
  dog: "狗狗夥伴",
  fox: "狐狸夥伴",
  rabbit: "兔子夥伴",
  bear: "熊熊夥伴",
  owl: "貓頭鷹夥伴",
};
