import "server-only";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

/** Persist avatars as data URLs so posters and exports never depend on expiring CDN links. */
export async function inlineRemoteImageUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`無法下載圖片 (${response.status})`);
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  if (!contentType.startsWith("image/")) {
    throw new Error("非圖片格式");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("圖片過大");
  }

  return `data:${contentType};base64,${buffer.toString("base64")}`;
}
