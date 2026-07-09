export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-display text-[var(--pixel-accent)]">📡 離線模式</p>
      <p className="text-caption max-w-sm text-[var(--pixel-text-muted)]">
        目前沒有網路連線。已快取的頁面仍可瀏覽，你的計畫資料保存在本機裝置中。
      </p>
      <a
        href="/"
        className="pixel-btn bg-[var(--pixel-accent)] px-6 py-3 font-pixel text-sm text-[var(--pixel-border)]"
      >
        返回基地
      </a>
    </main>
  );
}
