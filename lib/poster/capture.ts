function collectPosterImageUrls(element: HTMLElement): string[] {
  const urls = new Set<string>();

  element.querySelectorAll("[data-poster-bg]").forEach((node) => {
    const url = node.getAttribute("data-poster-bg");
    if (url) urls.add(url);
  });

  return [...urls];
}

async function preloadImages(urls: string[]) {
  await Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        })
    )
  );
}

export async function capturePosterPng(element: HTMLElement): Promise<Blob> {
  await preloadImages(collectPosterImageUrls(element));

  const html2canvas = (await import("html2canvas")).default;
  const { sanitizePosterClone } = await import("@/lib/poster/html2canvas");

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffe8b8",
    scale: 2,
    useCORS: true,
    onclone: (_doc, cloned) => {
      sanitizePosterClone(cloned);
    },
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("無法產生戰報圖片"))),
      "image/png"
    );
  });
}
