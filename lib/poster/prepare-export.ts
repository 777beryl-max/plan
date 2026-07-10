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

type StyleEdit = { element: HTMLElement; property: string; previous: string };

function fallbackFor(prop: string): string {
  if (prop.includes("background")) return POSTER_COLORS.white;
  if (prop === "fill" || prop === "stroke") return POSTER_COLORS.text;
  return POSTER_COLORS.text;
}

function stripUnsupportedColors(root: HTMLElement, set: (el: HTMLElement, prop: string, val: string) => void) {
  const view = root.ownerDocument.defaultView;
  if (!view) return;

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
        set(node, prop, fallbackFor(prop));
      }
    }
  }
}

/** Apply minimal export fixes on the live poster DOM, return restore function. */
export function preparePosterForExport(root: HTMLElement): () => void {
  const edits: StyleEdit[] = [];

  const set = (element: HTMLElement, property: string, value: string) => {
    edits.push({ element, property, previous: element.style.getPropertyValue(property) });
    element.style.setProperty(property, value);
  };

  const squad = root.querySelector("[data-poster-squad]");
  if (squad instanceof HTMLElement) {
    set(squad, "transform", "none");
  }

  stripUnsupportedColors(root, set);

  return () => {
    for (const { element, property, previous } of edits.reverse()) {
      if (previous) element.style.setProperty(property, previous);
      else element.style.removeProperty(property);
    }
  };
}
