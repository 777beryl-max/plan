let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  } catch {
    return null;
  }
}

/** 在使用者點擊「開始專注」時解鎖音訊，計時結束時才能播放 */
export function preparePomodoroAudio(): void {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "suspended") return;
  void ctx.resume();
}

/** 專注番茄鐘結束時的短促提示音 */
export function playPomodoroCompleteSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  void (async () => {
    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99];

      notes.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "square";
        oscillator.frequency.value = frequency;

        const start = now + index * 0.11;
        const duration = 0.28;

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(start);
        oscillator.stop(start + duration);
      });
    } catch {
      /* 靜音環境或瀏覽器限制時略過 */
    }
  })();
}
