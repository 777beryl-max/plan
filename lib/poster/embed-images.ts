function toAbsoluteUrl(url: string) {
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return new URL(url, window.location.origin).href;
}

function isSameOrigin(url: string): boolean {
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

async function proxyToDataUrl(absolute: string): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/poster/embed-image?url=${encodeURIComponent(absolute)}`,
      { credentials: "same-origin" }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { dataUrl?: string };
    return typeof data.dataUrl === "string" ? data.dataUrl : null;
  } catch {
    return null;
  }
}

async function urlToDataUrl(url: string): Promise<string | null> {
  const absolute = toAbsoluteUrl(url);
  if (absolute.startsWith("data:")) return absolute;

  if (!isSameOrigin(absolute)) {
    const proxied = await proxyToDataUrl(absolute);
    if (proxied) return proxied;
  }

  try {
    const response = await fetch(absolute, { mode: "cors", credentials: "omit" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image load failed"));
        img.src = absolute;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 1;
      canvas.height = img.naturalHeight || 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      if (!isSameOrigin(absolute)) {
        return proxyToDataUrl(absolute);
      }
      return null;
    }
  }
}

/** Inline poster images as data URLs so mobile PNG export always draws them. */
export async function embedPosterImages(element: HTMLElement) {
  const nodes = element.querySelectorAll<HTMLImageElement>("img[data-poster-char]");

  await Promise.all(
    Array.from(nodes).map(async (img) => {
      const url = img.getAttribute("data-poster-src") || img.currentSrc || img.src;
      if (!url || url.startsWith("data:")) return;

      const dataUrl = await urlToDataUrl(url);
      if (!dataUrl) return;

      img.setAttribute("data-poster-src", dataUrl);
      img.src = dataUrl;
    })
  );
}
