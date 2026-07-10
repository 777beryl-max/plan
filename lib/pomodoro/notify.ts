const TAG = "pomodoro-timer";

export async function requestPomodoroNotificationPermission(): Promise<void> {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

export async function showPomodoroNotification(
  title: string,
  body: string
): Promise<void> {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }

  const options: NotificationOptions = {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: TAG,
  };

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    /* fallback */
  }

  new Notification(title, options);
}
