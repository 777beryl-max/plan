import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/request";
import { loadUserData } from "@/lib/auth/server-store";
import { inlineRemoteImageUrl } from "@/lib/ai/inline-image";

function isPublicAiImageHost(url: URL): boolean {
  if (url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();
  return (
    host === "cdn.openai.com" ||
    host.endsWith(".openai.com") ||
    host.endsWith(".oaiusercontent.com") ||
    host.endsWith(".blob.core.windows.net") ||
    host.endsWith(".azure.com")
  );
}

async function profileAvatarUrl(userId: string): Promise<string | undefined> {
  const data = await loadUserData(userId);
  return data?.userProfiles?.[0]?.aiCharacterUrl;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "缺少 url 參數" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "無效的 url" }, { status: 400 });
  }

  if (target.protocol !== "https:" && !raw.startsWith("data:")) {
    return NextResponse.json({ error: "僅支援 https 圖片" }, { status: 400 });
  }

  const user = await getSessionUser();
  const ownsAvatar = user ? (await profileAvatarUrl(user.id)) === raw : false;

  if (!ownsAvatar && !isPublicAiImageHost(target)) {
    return NextResponse.json({ error: "不允許的圖片來源" }, { status: 400 });
  }

  try {
    const dataUrl = await inlineRemoteImageUrl(raw);
    return NextResponse.json({ dataUrl });
  } catch {
    return NextResponse.json({ error: "圖片轉換失敗" }, { status: 502 });
  }
}
