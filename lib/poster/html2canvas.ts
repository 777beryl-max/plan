import { POSTER_COLORS } from "./colors";

const UNSUPPORTED_COLOR = /okl(ch|ab)|color-mix|lab\(/i;

const COLOR_PROPS = [
  "color",
  "background-color",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "fill",
  "stroke",
] as const;

function fallbackFor(prop: string): string {
  if (prop.includes("background")) return POSTER_COLORS.white;
  if (prop === "fill" || prop === "stroke") return POSTER_COLORS.text;
  return POSTER_COLORS.text;
}

function convertPosterImagesToBackground(root: HTMLElement) {
  root.querySelectorAll("img[data-poster-char]").forEach((node) => {
    if (!(node instanceof HTMLImageElement)) return;
    const parent = node.parentElement;
    if (!parent) return;

    const src = node.currentSrc || node.src;
    if (!src) return;

    parent.style.backgroundImage = `url("${src}")`;
    parent.style.backgroundSize = "cover";
    parent.style.backgroundPosition = "center center";
    parent.style.backgroundRepeat = "no-repeat";
    node.remove();
  });
}

/** Strip oklab/color-mix values html2canvas cannot parse (cloned poster subtree). */
export function sanitizePosterClone(root: HTMLElement) {
  const view = root.ownerDocument.defaultView;
  if (!view) return;

  convertPosterImagesToBackground(root);

  root.querySelectorAll("[data-poster-pill]").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.style.display = "table";
    node.style.marginLeft = "auto";
    node.style.marginRight = "auto";

    const cell = node.querySelector("[data-poster-pill-label]");
    if (cell instanceof HTMLElement) {
      cell.style.display = "table-cell";
      cell.style.verticalAlign = "middle";
      cell.style.textAlign = "center";
      cell.style.width = "100%";
    }
  });

  root.querySelectorAll("[data-poster-name]").forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.overflow = "visible";
      node.style.lineHeight = "22px";
      node.style.minHeight = "24px";
      node.style.paddingBottom = "4px";
    }
  });

  const nodes: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];

  for (const node of nodes) {
    const computed = view.getComputedStyle(node);

    for (const prop of COLOR_PROPS) {
      const value = computed.getPropertyValue(prop);
      if (!value || !UNSUPPORTED_COLOR.test(value)) continue;

      if (node instanceof SVGElement && (prop === "fill" || prop === "stroke")) {
        node.setAttribute(prop, fallbackFor(prop));
        continue;
      }

      if (node instanceof HTMLElement) {
        node.style.setProperty(prop, fallbackFor(prop));
      }
    }
  }
}
