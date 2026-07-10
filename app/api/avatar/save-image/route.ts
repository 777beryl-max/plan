import { NextRequest, NextResponse } from "next/server";
import { inlineRemoteImageUrl } from "@/lib/ai/inline-image";
import { getSessionUser } from "@/lib/auth/request";
import { loadUserData } from "@/lib/auth/server-store";

async function profileAvatarUrl(userId: string): Promise<string | undefined> {
  const data = await loadUserData(userId);
  return data?.userProfiles?.[0]?.aiCharacterUrl;
}

/** Inline an existing avatar to a data URL. Does not consume AI generation quota. */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    let url = typeof body.url === "string" ? body.url.trim() : "";

    const user = await getSessionUser();
    const profileUrl = user ? await profileAvatarUrl(user.id) : undefined;

    if (!url && profileUrl) {
      url = profileUrl;
    }

    if (!url) {
      return NextResponse.json({ error: "缺少頭像網址" }, { status: 400 });
    }

    if (url.startsWith("data:")) {
      return NextResponse.json({ dataUrl: url });
    }

    if (user && profileUrl && profileUrl !== url) {
      return NextResponse.json({ error: "僅能儲存自己的頭像" }, { status: 403 });
    }

    const dataUrl = await inlineRemoteImageUrl(url);
    return NextResponse.json({ dataUrl });
  } catch (err) {
    console.error("save-image error:", err);
    return NextResponse.json(
      { error: "頭像儲存失敗，連結可能已過期" },
      { status: 502 }
    );
  }
}
