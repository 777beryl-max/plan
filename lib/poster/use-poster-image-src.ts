import { useEffect, useState } from "react";
import { resolvePosterImageUrl } from "@/lib/poster/embed-images";

/** Preload poster character images as data URLs for reliable display and PNG export. */
export function usePosterImageSrc(raw?: string) {
  const [src, setSrc] = useState<string | undefined>(raw);

  useEffect(() => {
    if (!raw) {
      setSrc(undefined);
      return;
    }

    if (raw.startsWith("data:")) {
      setSrc(raw);
      return;
    }

    let cancelled = false;
    setSrc(raw);

    resolvePosterImageUrl(raw).then((resolved) => {
      if (!cancelled && resolved) setSrc(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [raw]);

  return src;
}
