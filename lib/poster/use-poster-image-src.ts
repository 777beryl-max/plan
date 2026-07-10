import { useEffect, useState } from "react";
import { persistAvatarImageUrl } from "@/lib/avatar/persist-image";

export interface PosterImageState {
  src?: string;
  ready: boolean;
}

interface UsePosterImageSrcOptions {
  /** Same-origin URL (e.g. /api/avatar/image) — reliable on mobile export. */
  proxySrc?: string;
}

/**
 * Resolve poster character images before rendering.
 * Remote OpenAI URLs are never passed directly to poster <img>.
 */
export function usePosterImageSrc(
  raw?: string,
  options?: UsePosterImageSrcOptions
): PosterImageState {
  const proxySrc = options?.proxySrc;
  const [src, setSrc] = useState<string | undefined>(() => {
    if (proxySrc) return proxySrc;
    if (raw && (raw.startsWith("data:") || raw.startsWith("/"))) return raw;
    return undefined;
  });
  const [ready, setReady] = useState(() => {
    if (!raw) return true;
    if (proxySrc) return true;
    return raw.startsWith("data:") || raw.startsWith("/");
  });

  useEffect(() => {
    if (!raw) {
      setSrc(undefined);
      setReady(true);
      return;
    }

    if (proxySrc) {
      setSrc(proxySrc);
      setReady(true);
      return;
    }

    if (raw.startsWith("data:") || raw.startsWith("/")) {
      setSrc(raw);
      setReady(true);
      return;
    }

    let cancelled = false;
    setSrc(undefined);
    setReady(false);

    persistAvatarImageUrl(raw).then((resolved) => {
      if (cancelled) return;
      setSrc(resolved ?? undefined);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [raw, proxySrc]);

  return { src, ready };
}
