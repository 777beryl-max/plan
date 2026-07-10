import { NextRequest, NextResponse } from "next/server";
import type { CharacterStyle, CharacterGender } from "@/lib/types";
import { generateCharacterImage } from "@/lib/ai/dalle";
import { describeReferenceImage, validateReferenceImage } from "@/lib/ai/reference-image";
import { buildCharacterImagePrompt } from "@/lib/theme/adventure-style";
import {
  applyCorsHeaders,
  getRateLimitKey,
  toClientErrorMessage,
} from "@/lib/api/security";
import { getSessionUser } from "@/lib/auth/request";
import { reserveAvatarGeneration } from "@/lib/avatar/generation-tracker";
import { MAX_AVATAR_GENERATIONS } from "@/lib/avatar/limits";

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

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  applyCorsHeaders(response, request);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const displayName = body.displayName as string;
    const style = (body.style as CharacterStyle) ?? "brave";
    const gender = (body.gender as CharacterGender) ?? "neutral";
    const referenceImageBase64 = body.referenceImageBase64 as string | undefined;
    const referenceImageMimeType = body.referenceImageMimeType as string | undefined;
    const clientCount =
      typeof body.avatarGenerationCount === "number" ? body.avatarGenerationCount : 0;

    if (!displayName?.trim()) {
      return jsonResponse(request, { error: "請提供冒險者名稱" }, 400);
    }

    const user = await getSessionUser();
    const trackingKey = await getAvatarTrackingKey(request, user?.id);
    const quota = await reserveAvatarGeneration(trackingKey, clientCount);

    if (!quota.allowed) {
      return jsonResponse(
        request,
        {
          error: `換頭像次數已用完（最多 ${MAX_AVATAR_GENERATIONS - 1} 次）`,
          avatarGenerationCount: quota.count,
          remainingChanges: quota.remaining,
        },
        403
      );
    }

    const hasReference = Boolean(referenceImageBase64 && referenceImageMimeType);

    let referenceDesc = "";
    if (hasReference) {
      const validationError = validateReferenceImage(
        referenceImageBase64!,
        referenceImageMimeType!
      );
      if (validationError) {
        return jsonResponse(request, { error: validationError }, 400);
      }
      referenceDesc = await describeReferenceImage(
        referenceImageBase64!,
        referenceImageMimeType!
      );
    }

    const prompt = buildCharacterImagePrompt({ style, gender, referenceDesc });
    const url = await generateCharacterImage(prompt);

    return jsonResponse(request, {
      url,
      displayName,
      style,
      gender,
      usedReference: hasReference,
      avatarGenerationCount: quota.count,
      remainingChanges: quota.remaining,
    });
  } catch (err) {
    console.error("Character generation error:", err);
    return jsonResponse(
      request,
      { error: toClientErrorMessage(err, "生成失敗") },
      500
    );
  }
}
