import "server-only";

import { createOpenAIClient } from "@/lib/ai/dalle";

const MAX_REFERENCE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateReferenceImage(
  base64: string,
  mimeType: string
): string | null {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return "僅支援 JPG、PNG、WebP、GIF 格式";
  }

  const estimatedBytes = Math.ceil((base64.length * 3) / 4);
  if (estimatedBytes > MAX_REFERENCE_BYTES) {
    return "參考圖片不能超過 4MB";
  }

  return null;
}

export async function describeReferenceImage(
  base64: string,
  mimeType: string
): Promise<string> {
  const validationError = validateReferenceImage(base64, mimeType);
  if (validationError) {
    throw new Error(validationError);
  }

  const openai = createOpenAIClient();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: [
              "Analyze this reference image for a cute chibi adventure game hero avatar.",
              "The art style should match a cozy kawaii RPG with sky blue, cream, coral and mint pastel colors.",
              "Describe only visual traits: hairstyle, hair color, skin tone, eye features,",
              "clothing style and colors, accessories, expression, and overall vibe.",
              "Output one concise English comma-separated phrase list for image generation.",
              "Do not include names, text, or watermarks. Max 60 words.",
            ].join(" "),
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
            },
          },
        ],
      },
    ],
  });

  const description = response.choices[0]?.message?.content?.trim();
  if (!description) {
    throw new Error("無法分析參考圖片");
  }

  return description;
}
