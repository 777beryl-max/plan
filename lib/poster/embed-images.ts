function toAbsoluteUrl(url: string) {
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return new URL(url, window.location.origin).href;
}

async function urlToDataUrl(url: string): Promise<string | null> {
  const absolute = toAbsoluteUrl(url);
  if (absolute.startsWith("data:")) return absolute;

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
      return null;
    }
  }
}

/** Embed poster avatars as data URLs so mobile html2canvas always draws them. */
export async function embedPosterImages(element: HTMLElement) {
  const nodes = element.querySelectorAll("[data-poster-bg]");
  await Promise.all(
    Array.from(nodes).map(async (node) => {
      if (!(node instanceof HTMLElement)) return;
      const url = node.getAttribute("data-poster-bg");
      if (!url) return;
      const dataUrl = await urlToDataUrl(url);
      if (!dataUrl) return;
      node.setAttribute("data-poster-bg", dataUrl);
      node.style.backgroundImage = `url("${dataUrl}")`;
      node.style.backgroundSize = "cover";
      node.style.backgroundPosition = "center center";
      node.style.backgroundRepeat = "no-repeat";
    })
  );
}
