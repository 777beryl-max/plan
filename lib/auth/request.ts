import "server-only";

import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/auth/types";
import { getAccountById } from "@/lib/auth/server-store";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return getAccountById(payload.userId);
}
