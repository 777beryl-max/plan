import { POSTER_FRAME_RADIUS } from "@/lib/poster/colors";
import { resolvePosterImageUrl } from "@/lib/poster/embed-images";

export interface PosterImageLayer {
  image: CanvasImageSource;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

async function loadComposeImage(url: string): Promise<HTMLImageElement | null> {
  let source = url;

  if (source.startsWith("/api/")) {
    try {
      const response = await fetch(source, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) return null;
      const blob = await response.blob();
      source = URL.createObjectURL(blob);
    } catch {
      return null;
    }
  } else if (!source.startsWith("data:") && !source.startsWith("blob:")) {
    const resolved = await resolvePosterImageUrl(source);
    if (!resolved) return null;
    source = resolved;
  }

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

export async function collectPosterImageLayers(poster: HTMLElement): Promise<PosterImageLayer[]> {
  const root = poster.getBoundingClientRect();
  const layers: PosterImageLayer[] = [];

  const images = poster.querySelectorAll<HTMLImageElement>("img[data-poster-char]");
  await Promise.all(
    Array.from(images).map(async (img) => {
      const face =
        img.closest<HTMLElement>("[data-poster-frame-face]") ?? img.parentElement;
      if (!face) return;

      const rect = face.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const url = img.getAttribute("data-poster-src") || img.currentSrc || img.src;
      if (!url) return;

      const drawable = await loadComposeImage(url);
      if (!drawable) return;

      layers.push({
        image: drawable,
        x: rect.left - root.left,
        y: rect.top - root.top,
        width: rect.width,
        height: rect.height,
        borderRadius: POSTER_FRAME_RADIUS - 3,
      });
    })
  );

  return layers;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function paintPosterImageLayers(
  canvas: HTMLCanvasElement,
  layers: PosterImageLayer[],
  scale: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  for (const layer of layers) {
    const x = layer.x * scale;
    const y = layer.y * scale;
    const width = layer.width * scale;
    const height = layer.height * scale;
    const radius = layer.borderRadius * scale;

    ctx.save();
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.clip();
    ctx.drawImage(layer.image, x, y, width, height);
    ctx.restore();
  }
}
