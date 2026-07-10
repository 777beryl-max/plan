import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Nunito } from "next/font/google";
import "./globals.css";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { PwaProvider } from "@/components/providers/PwaProvider";
import { StoreInitializer } from "@/components/providers/StoreInitializer";

const notoSansTC = Noto_Sans_TC({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const nunito = Nunito({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-round",
  display: "swap",
});

const APP_NAME = "人生冒險遊戲";
const APP_DESCRIPTION = "把人生目標，變成能完成的日常";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} | ${APP_DESCRIPTION}`,
    template: `%s | ${APP_NAME}`,
  },
  description: "像素風 RPG 目標管理 — 月/周/日計畫、番茄鐘、動物夥伴、AI 角色",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${notoSansTC.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full antialiased">
        <PwaProvider>
          <StoreInitializer>
            <ConditionalShell>{children}</ConditionalShell>
          </StoreInitializer>
        </PwaProvider>
      </body>
    </html>
  );
}
