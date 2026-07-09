import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/request";
import { applyCorsHeaders } from "@/lib/api/security";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  const res = NextResponse.json({ user });
  applyCorsHeaders(res, request);
  return res;
}
