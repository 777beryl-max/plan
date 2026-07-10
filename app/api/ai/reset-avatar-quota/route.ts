import { NextRequest, NextResponse } from "next/server";
import {
  applyCorsHeaders,
  getRateLimitKey,
} from "@/lib/api/security";
import { getSessionUser } from "@/lib/auth/request";
import { resetAvatarGeneration } from "@/lib/avatar/generation-tracker";

function jsonResponse(request: NextRequest, body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  applyCorsHeaders(response, request);
  return response;
}

async function getAvatarTrackingKey(
  request: NextRequest,
  userId?: string | null
): Promise<string> {
  if (userId) return `user:${userId}`;
  return getRateLimitKey(request);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const trackingKey = await getAvatarTrackingKey(request, user?.id);
  await resetAvatarGeneration(trackingKey);
  return jsonResponse(request, { ok: true });
}
