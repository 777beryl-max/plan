import { embedPosterImages } from "@/lib/poster/embed-images";
import { preparePosterForExport } from "@/lib/poster/prepare-export";

const CAPTURE_SCALE = 2;

function collectPosterImageUrls(element: HTMLElement): string[] {
  const urls = new Set<string>();

  element.querySelectorAll("img[data-poster-char]").forEach((node) => {
    const url = node.getAttribute("data-poster-src") || node.getAttribute("src");
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

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((response) => response.blob());
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("無法產生戰報圖片"))),
      "image/png"
    );
  });
}

async function captureWithHtmlToImage(element: HTMLElement): Promise<Blob> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    pixelRatio: CAPTURE_SCALE,
    backgroundColor: "#ffe8b8",
    cacheBust: true,
    skipFonts: false,
  });
  return dataUrlToBlob(dataUrl);
}

async function captureWithHtml2Canvas(element: HTMLElement): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffe8b8",
    scale: CAPTURE_SCALE,
    useCORS: true,
  });
  return canvasToBlob(canvas);
}

export async function capturePosterPng(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  await preloadImages(collectPosterImageUrls(element));

  const restore = preparePosterForExport(element);

  try {
    await embedPosterImages(element);
    await waitForPaint();

    try {
      return await captureWithHtmlToImage(element);
    } catch {
      return await captureWithHtml2Canvas(element);
    }
  } finally {
    restore();
  }
}
