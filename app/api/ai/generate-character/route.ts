import { NextRequest, NextResponse } from "next/server";
import type { CharacterStyle, CharacterGender } from "@/lib/types";
import { generateCharacterImage } from "@/lib/ai/dalle";
import { describeReferenceImage, validateReferenceImage } from "@/lib/ai/reference-image";
import { buildCharacterImagePrompt } from "@/lib/theme/adventure-style";
import { applyCorsHeaders, toClientErrorMessage } from "@/lib/api/security";

const generatedCache = new Set<string>();

function jsonResponse(request: NextRequest, body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  applyCorsHeaders(response, request);
  return response;
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

    if (!displayName?.trim()) {
      return jsonResponse(request, { error: "請提供冒險者名稱" }, 400);
    }

    const hasReference = Boolean(referenceImageBase64 && referenceImageMimeType);
    const cacheKey = `${displayName}-${style}-${gender}-${hasReference ? "ref" : "nore"}`;
    if (generatedCache.has(cacheKey)) {
      return jsonResponse(request, { error: "角色已生成，不可重複生成" }, 403);
    }

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

    generatedCache.add(cacheKey);

    return jsonResponse(request, {
      url,
      displayName,
      style,
      gender,
      usedReference: hasReference,
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
