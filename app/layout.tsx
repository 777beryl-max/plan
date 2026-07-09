import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { PwaProvider } from "@/components/providers/PwaProvider";
import { StoreInitializer } from "@/components/providers/StoreInitializer";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
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
    statusBarStyle: "black-translucent",
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
  themeColor: "#2d1b4e",
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
    <html lang="zh-TW" className={`${pressStart.variable} ${vt323.variable} h-full`}>
      <body className="min-h-full">
        <PwaProvider>
          <StoreInitializer>
            <ConditionalShell>{children}</ConditionalShell>
          </StoreInitializer>
        </PwaProvider>
      </body>
    </html>
  );
}
