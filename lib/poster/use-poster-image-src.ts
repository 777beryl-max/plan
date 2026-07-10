import { useEffect, useState } from "react";
import { persistAvatarImageUrl } from "@/lib/avatar/persist-image";

export interface PosterImageState {
  /** Resolved src safe for poster display/export (data URL or same-origin path). */
  src?: string;
  /** False while resolving a remote avatar URL. */
  ready: boolean;
}

/**
 * Resolve poster character images before rendering.
 * Never passes expiring OpenAI https URLs to the poster <img>.
 */
export function usePosterImageSrc(raw?: string): PosterImageState {
  const [src, setSrc] = useState<string | undefined>(
    raw && (raw.startsWith("data:") || raw.startsWith("/")) ? raw : undefined
  );
  const [ready, setReady] = useState(
    !raw || raw.startsWith("data:") || raw.startsWith("/")
  );

  useEffect(() => {
    if (!raw) {
      setSrc(undefined);
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
  }, [raw]);

  return { src, ready };
}
