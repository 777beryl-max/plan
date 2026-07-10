import type { ImgHTMLAttributes } from "react";

interface AdventureAvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-16 h-16",
  md: "w-[7.5rem] h-[7.5rem]",
  lg: "w-32 h-32",
};

/** 與夥伴框一致的冒險者頭像框 */
export function AdventureAvatar({
  src,
  alt,
  size = "md",
  className = "",
  ...props
}: AdventureAvatarProps) {
  return (
    <div
      className={`adventure-avatar-frame ${SIZES[size]} shrink-0 ${className}`}
    >
      <img src={src} alt={alt} className="adventure-avatar-img" {...props} />
    </div>
  );
}
