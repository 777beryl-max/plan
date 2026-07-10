import { resolvePosterImageUrl } from "@/lib/poster/embed-images";

/** Save an existing avatar URL as a data URL — does not use AI generation quota. */
export async function persistAvatarImageUrl(currentUrl: string): Promise<string | null> {
  if (currentUrl.startsWith("data:")) return currentUrl;

  const fromClient = await resolvePosterImageUrl(currentUrl);
  if (fromClient) return fromClient;

  try {
    const response = await fetch("/api/avatar/save-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ url: currentUrl }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { dataUrl?: string };
    return typeof data.dataUrl === "string" ? data.dataUrl : null;
  } catch {
    return null;
  }
}

export function imageElementToDataUrl(img: HTMLImageElement): string | null {
  if (!img.complete || img.naturalWidth === 0) return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/** Try proxy/API first, then capture from an already-rendered img element. */
export async function persistAvatarImageUrlWithFallback(
  currentUrl: string,
  loadedImg?: HTMLImageElement | null
): Promise<string | null> {
  const persisted = await persistAvatarImageUrl(currentUrl);
  if (persisted) return persisted;
  if (loadedImg) return imageElementToDataUrl(loadedImg);
  return null;
}
