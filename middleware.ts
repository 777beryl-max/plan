import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiSecurityResponse, applyCorsHeaders } from "@/lib/api/security";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const securityResponse = apiSecurityResponse(request);
  if (securityResponse) {
    return securityResponse;
  }

  const response = NextResponse.next();
  applyCorsHeaders(response, request);
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
