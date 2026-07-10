import type { WeeklyReport } from "@/lib/types";
import { getShareText } from "@/lib/weekly-report";

export type PosterShareResult = "shared" | "unsupported" | "cancelled";

function isUserCancelled(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function buildPosterFile(blob: Blob, filename: string) {
  return new File([blob], filename, {
    type: "image/png",
    lastModified: Date.now(),
  });
}

/** Try Web Share API with PNG file (best for LINE / 訊息 / 相簿等). */
export async function sharePosterPng(
  blob: Blob,
  filename: string,
  report: WeeklyReport
): Promise<PosterShareResult> {
  if (typeof navigator.share !== "function") return "unsupported";

  const file = buildPosterFile(blob, filename);
  const text = getShareText(report);
  const payloads: ShareData[] = [
    { files: [file] },
    { files: [file], title: "週冒險戰報" },
    { files: [file], title: "週冒險戰報", text },
  ];

  for (const payload of payloads) {
    if (
      payload.files &&
      typeof navigator.canShare === "function" &&
      !navigator.canShare(payload)
    ) {
      continue;
    }

    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (isUserCancelled(error)) return "cancelled";
    }
  }

  // Some desktop browsers report canShare=false but share still works.
  try {
    await navigator.share({ files: [file], title: "週冒險戰報" });
    return "shared";
  } catch (error) {
    if (isUserCancelled(error)) return "cancelled";
    return "unsupported";
  }
}

export async function copyPosterPngToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    return false;
  }

  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}
