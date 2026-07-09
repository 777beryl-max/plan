import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerAccount } from "@/lib/auth/server-store";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { applyCorsHeaders } from "@/lib/api/security";

function json(request: NextRequest, body: unknown, status = 200) {
  const res = NextResponse.json(body, { status });
  applyCorsHeaders(res, request);
  return res;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const displayName = String(body.displayName ?? "").trim();

    if (!email || !password) {
      return json(request, { error: "請填寫 Email 與密碼" }, 400);
    }
    if (password.length < 6) {
      return json(request, { error: "密碼至少 6 個字元" }, 400);
    }

    const user = await registerAccount(email, password, displayName || "冒險者");
    const token = await createSessionToken(user);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

    return json(request, { user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "註冊失敗";
    return json(request, { error: message }, 400);
  }
}
