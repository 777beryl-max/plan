import { NextRequest, NextResponse } from "next/server";
import type { CharacterStyle, CharacterGender } from "@/lib/types";
import { generateCharacterImage } from "@/lib/ai/dalle";
import { describeReferenceImage, validateReferenceImage } from "@/lib/ai/reference-image";
import { applyCorsHeaders, toClientErrorMessage } from "@/lib/api/security";

const STYLE_PROMPTS: Record<CharacterStyle, string> = {
  brave: "brave warrior with sword, confident pose",
  healing: "gentle healer with staff, warm smile",
  scholar: "wise scholar with book, thoughtful expression",
};

const GENDER_PROMPTS: Record<CharacterGender, string> = {
  male: "male character, masculine features",
  female: "female character, feminine features",
  neutral: "androgynous character, gender-neutral features",
};

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

    const styleDesc = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.brave;
    const genderDesc = GENDER_PROMPTS[gender] ?? GENDER_PROMPTS.neutral;

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

    const promptParts = [
      "pixel art RPG hero portrait",
      "16-bit retro game style",
      genderDesc,
      styleDesc,
    ];

    if (referenceDesc) {
      promptParts.push(`inspired by reference image features: ${referenceDesc}`);
    }

    promptParts.push(
      "simple friendly character",
      "solid purple background",
      "front facing",
      "chibi style",
      "no text",
      "no watermark"
    );

    const prompt = promptParts.join(", ");
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
