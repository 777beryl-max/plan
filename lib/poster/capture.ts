import { embedPosterImages } from "@/lib/poster/embed-images";
import {
  collectPosterImageLayers,
  paintPosterImageLayers,
} from "@/lib/poster/compose-images";
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
          if (url.startsWith("/api/")) {
            fetch(url, { credentials: "same-origin" })
              .then(() => resolve())
              .catch(() => resolve());
            return;
          }

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

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("無法產生戰報圖片"))),
      "image/png"
    );
  });
}

async function captureWithHtmlToImage(element: HTMLElement): Promise<HTMLCanvasElement> {
  const { toCanvas } = await import("html-to-image");
  return toCanvas(element, {
    pixelRatio: CAPTURE_SCALE,
    backgroundColor: "#ffe8b8",
    cacheBust: true,
    skipFonts: false,
  });
}

async function captureWithHtml2Canvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;
  return html2canvas(element, {
    backgroundColor: "#ffe8b8",
    scale: CAPTURE_SCALE,
    useCORS: true,
  });
}

async function waitForPosterImages(element: HTMLElement) {
  const imgs = element.querySelectorAll<HTMLImageElement>("img[data-poster-char]");
  await Promise.all(
    Array.from(imgs).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          window.setTimeout(done, 8000);
        })
    )
  );
}

export async function capturePosterPng(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  await preloadImages(collectPosterImageUrls(element));

  const restore = preparePosterForExport(element);

  try {
    await embedPosterImages(element);
    await waitForPosterImages(element);
    await waitForPaint();

    const imageLayers = await collectPosterImageLayers(element);

    let canvas: HTMLCanvasElement;
    try {
      canvas = await captureWithHtmlToImage(element);
    } catch {
      canvas = await captureWithHtml2Canvas(element);
    }

    paintPosterImageLayers(canvas, imageLayers, CAPTURE_SCALE);

    return canvasToBlob(canvas);
  } finally {
    restore();
  }
}
