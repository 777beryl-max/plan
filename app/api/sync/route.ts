import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/request";
import { loadUserData, saveUserData } from "@/lib/auth/server-store";
import { toAuthErrorMessage } from "@/lib/auth/storage";
import type { UserDataBundle } from "@/lib/sync/types";
import { applyCorsHeaders } from "@/lib/api/security";

function json(request: NextRequest, body: unknown, status = 200) {
  const res = NextResponse.json(body, { status });
  applyCorsHeaders(res, request);
  return res;
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return json(request, { error: "未登入" }, 401);
  }

  const data = await loadUserData(user.id);
  return json(request, {
    data,
    syncedAt: data?.exportedAt ?? null,
  });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return json(request, { error: "未登入" }, 401);
  }

  try {
    const body = (await request.json()) as UserDataBundle;
    if (!body || typeof body !== "object") {
      return json(request, { error: "無效的同步資料" }, 400);
    }

    await saveUserData(user.id, body);
    return json(request, {
      ok: true,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    return json(request, { error: toAuthErrorMessage(err, "同步失敗") }, 500);
  }
}
