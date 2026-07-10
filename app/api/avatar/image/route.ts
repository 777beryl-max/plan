import { NextResponse } from "next/server";
import { inlineRemoteImageUrl } from "@/lib/ai/inline-image";
import { getSessionUser } from "@/lib/auth/request";
import { loadUserData } from "@/lib/auth/server-store";

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

/** Same-origin avatar image for poster export (mobile-safe). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return new NextResponse("未登入", { status: 401 });
  }

  const data = await loadUserData(user.id);
  const avatarUrl = data?.userProfiles?.[0]?.aiCharacterUrl;
  if (!avatarUrl) {
    return new NextResponse("尚無頭像", { status: 404 });
  }

  try {
    if (avatarUrl.startsWith("data:")) {
      const parsed = dataUrlToBuffer(avatarUrl);
      if (!parsed) {
        return new NextResponse("頭像格式錯誤", { status: 400 });
      }
      return new NextResponse(new Uint8Array(parsed.buffer), {
        headers: {
          "Content-Type": parsed.contentType,
          "Cache-Control": "private, max-age=300",
        },
      });
    }

    const inlined = await inlineRemoteImageUrl(avatarUrl);
    const parsed = dataUrlToBuffer(inlined);
    if (!parsed) {
      return new NextResponse("頭像格式錯誤", { status: 400 });
    }

    return new NextResponse(new Uint8Array(parsed.buffer), {
      headers: {
        "Content-Type": parsed.contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new NextResponse("頭像已過期", { status: 502 });
  }
}
