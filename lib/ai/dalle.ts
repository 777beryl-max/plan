import "server-only";

import OpenAI from "openai";

type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";
type GptImageQuality = "low" | "medium" | "high" | "auto";

interface ImageModelAttempt {
  model: string;
  size: ImageSize;
  quality?: GptImageQuality;
  response_format?: "url" | "b64_json";
}

const DEFAULT_MODEL_ATTEMPTS: ImageModelAttempt[] = [
  { model: "gpt-image-1", size: "1024x1024", quality: "medium" },
  { model: "gpt-image-1-mini", size: "1024x1024", quality: "medium" },
  { model: "dall-e-2", size: "1024x1024", response_format: "url" },
];

export function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("未設定 OPENAI_API_KEY，請在 .env.local 中配置");
  }
  if (!apiKey.startsWith("sk-")) {
    throw new Error("OPENAI_API_KEY 格式不正確");
  }
  return new OpenAI({ apiKey });
}

function getModelAttempts(): ImageModelAttempt[] {
  const preferred = process.env.OPENAI_IMAGE_MODEL?.trim();
  if (!preferred) return DEFAULT_MODEL_ATTEMPTS;

  const match = DEFAULT_MODEL_ATTEMPTS.find((m) => m.model === preferred);
  if (match) return [match, ...DEFAULT_MODEL_ATTEMPTS.filter((m) => m.model !== preferred)];

  return [{ model: preferred, size: "1024x1024", quality: "medium" }, ...DEFAULT_MODEL_ATTEMPTS];
}

function isRetryableModelError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("model_not_found") ||
    lower.includes("unknown parameter") ||
    lower.includes("deprecated") ||
    lower.includes("not supported")
  );
}

function toImageSrc(item: { url?: string | null; b64_json?: string | null }): string | null {
  if (item.url) return item.url;
  if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  return null;
}

/** 生成角色頭像，自動嘗試 gpt-image-1 → gpt-image-1-mini → dall-e-2 */
export async function generateCharacterImage(prompt: string): Promise<string> {
  const openai = createOpenAIClient();
  const attempts = getModelAttempts();
  let lastError: Error | null = null;

  for (const config of attempts) {
    try {
      const params: OpenAI.Images.ImageGenerateParams = {
        model: config.model,
        prompt,
        n: 1,
        size: config.size,
      };

      if (config.quality) {
        params.quality = config.quality;
      }
      if (config.response_format) {
        params.response_format = config.response_format;
      }

      const response = await openai.images.generate(params);
      if (!("data" in response)) {
        lastError = new Error("圖片生成失敗");
        continue;
      }

      const item = response.data?.[0];
      if (!item) {
        lastError = new Error("圖片生成失敗");
        continue;
      }

      const src = toImageSrc(item);
      if (src) return src;

      lastError = new Error("圖片生成失敗");
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("圖片生成失敗");
      if (isRetryableModelError(lastError.message)) {
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("圖片生成失敗，請確認 API Key 具備圖像生成權限");
}

/** @deprecated 使用 generateCharacterImage */
export const generateDalle3Image = generateCharacterImage;
