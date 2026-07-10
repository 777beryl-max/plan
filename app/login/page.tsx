"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adventure-world min-h-screen flex items-center justify-center p-4">
      <div className="adventure-content w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-4xl mb-2 float-gentle">⚔️</p>
          <h1 className="game-banner-title leading-relaxed">
            人生冒險遊戲
          </h1>
          <p className="font-body text-sm text-[var(--pixel-text-muted)] mt-2">
            登入後自動同步你的冒險記錄
          </p>
        </div>

        <PixelCard title={mode === "login" ? "🔐 登入" : "✨ 註冊"} accent>
          <div className="flex gap-2 mb-4">
            <PixelButton
              variant={mode === "login" ? "primary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("login")}
            >
              登入
            </PixelButton>
            <PixelButton
              variant={mode === "register" ? "primary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("register")}
            >
              註冊
            </PixelButton>
          </div>

          <div className="space-y-3">
            {mode === "register" && (
              <PixelInput
                label="冒險者名稱"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="你的暱稱"
              />
            )}
            <PixelInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <PixelInput
              label="密碼"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 個字元"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <p className="font-body text-base text-[var(--pixel-hp)] mt-3">{error}</p>
          )}

          <PixelButton
            className="w-full mt-4"
            onClick={submit}
            disabled={loading || !email.trim() || !password}
          >
            {loading ? "處理中..." : mode === "login" ? "開始冒險" : "建立帳號"}
          </PixelButton>
        </PixelCard>

        <p className="font-body text-base text-center text-[var(--pixel-text-muted)]">
          資料會安全儲存在伺服器，換裝置登入即可恢復進度
        </p>
      </div>
    </div>
  );
}
