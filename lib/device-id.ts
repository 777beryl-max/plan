const STORAGE_KEY = "bullet-plan-device-id";

/** 客戶端裝置識別碼（僅用於 API 限流，不含敏感資訊） */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
