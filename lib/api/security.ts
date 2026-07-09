import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PRODUCTION_ORIGIN = "https://plan-lake-eight.vercel.app";

/** 每裝置每分鐘最多 2 次 API 請求（全站共用額度） */
const DEVICE_RATE_LIMIT = {
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "2", 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? String(60 * 1000), 10),
};

function getAllowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (fromEnv?.length) {
    return fromEnv;
  }

  if (process.env.NODE_ENV === "production") {
    return [PRODUCTION_ORIGIN];
  }

  return ["http://localhost:3000", "http://127.0.0.1:3000"];
}

function originFromUrl(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function hostMatchesAllowed(host: string, allowed: string[]): boolean {
  return allowed.some((entry) => {
    const origin = originFromUrl(entry);
    if (!origin) return false;
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  });
}

/** 僅允許設定網域呼叫 API */
export function isAllowedOrigin(request: NextRequest): boolean {
  const allowed = getAllowedOrigins();
  if (allowed.length === 0) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    return allowed.includes(origin);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    const refOrigin = originFromUrl(referer);
    return refOrigin ? allowed.includes(refOrigin) : false;
  }

  const host = request.headers.get("host");
  if (host && hostMatchesAllowed(host, allowed)) {
    return true;
  }

  return false;
}

export function buildCorsHeaders(request: NextRequest): Record<string, string> {
  const allowed = getAllowedOrigins();
  const origin = request.headers.get("origin");
  const allowOrigin =
    origin && allowed.includes(origin) ? origin : allowed[0] ?? "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-device-id",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function getRateLimitKey(request: NextRequest): string {
  const deviceId = request.headers.get("x-device-id")?.trim();
  if (deviceId && UUID_RE.test(deviceId)) {
    return `device:${deviceId}`;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  return `ip:${ip}`;
}

export function applyCorsHeaders(response: NextResponse, request: NextRequest) {
  const headers = buildCorsHeaders(request);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
}

/**
 * API 安全檢查：來源網域 + 裝置限流。
 * 回傳 NextResponse 表示應直接回應；回傳 null 表示可繼續處理請求。
 */
export function apiSecurityResponse(request: NextRequest): NextResponse | null {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { error: "不允許的請求來源" },
      { status: 403, headers: buildCorsHeaders(request) }
    );
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: buildCorsHeaders(request),
    });
  }

  const key = getRateLimitKey(request);
  const result = checkRateLimit(key, DEVICE_RATE_LIMIT.max, DEVICE_RATE_LIMIT.windowMs);

  if (!result.ok) {
    return NextResponse.json(
      { error: "請求過於頻繁，請稍後再試" },
      {
        status: 429,
        headers: {
          ...buildCorsHeaders(request),
          "Retry-After": String(result.retryAfter ?? 60),
        },
      }
    );
  }

  return null;
}

/** 避免將伺服器設定錯誤洩漏給前端 */
export function toClientErrorMessage(err: unknown, fallback = "服務暫時無法使用"): string {
  if (!(err instanceof Error)) return fallback;
  const msg = err.message;
  if (
    msg.includes("OPENAI_API_KEY") ||
    msg.includes("API Key") ||
    msg.includes("API key") ||
    msg.includes("Incorrect API key") ||
    msg.includes("401") ||
    msg.includes("sk-")
  ) {
    return fallback;
  }
  return msg;
}
