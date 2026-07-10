import Link from "next/link";
import { PixelButton } from "@/components/ui/PixelButton";

interface PageBackLinkProps {
  href?: string;
  label?: string;
}

/** 子頁頂部返回，與下方區塊保持足夠間距 */
export function PageBackLink({ href = "/", label = "← 返回基地" }: PageBackLinkProps) {
  return (
    <div className="mb-8">
      <Link href={href} className="inline-block">
        <PixelButton variant="ghost" size="sm">
          {label}
        </PixelButton>
      </Link>
    </div>
  );
}
