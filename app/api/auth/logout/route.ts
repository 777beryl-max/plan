import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { applyCorsHeaders } from "@/lib/api/security";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  const res = NextResponse.json({ ok: true });
  applyCorsHeaders(res, request);
  return res;
}
