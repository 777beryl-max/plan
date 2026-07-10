import { NextRequest, NextResponse } from "next/server";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

function isAllowedImageUrl(url: URL): boolean {
  if (url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();
  return (
    host.endsWith(".openai.com") ||
    host.endsWith(".blob.core.windows.net") ||
    host.endsWith(".oaiusercontent.com") ||
    host.endsWith(".azure.com")
  );
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

  if (!isAllowedImageUrl(target)) {
    return NextResponse.json({ error: "不允許的圖片來源" }, { status: 400 });
  }

  try {
    const response = await fetch(target.toString(), { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "無法取得圖片" }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "非圖片格式" }, { status: 400 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "圖片過大" }, { status: 400 });
    }

    const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
    return NextResponse.json({ dataUrl });
  } catch {
    return NextResponse.json({ error: "圖片轉換失敗" }, { status: 502 });
  }
}
