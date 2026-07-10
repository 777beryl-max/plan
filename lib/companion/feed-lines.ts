const FEED_LINES_BY_LEVEL: Record<number, string[]> = {
  1: ["好好吃～", "謝謝你！", "還想要一點～", "好幸福呀！"],
  2: ["這個味道太棒了！", "你對我最好了～", "吃完有力氣陪你冒險！", "汪嗚～超滿足！"],
  3: [
    "今天也一起加油喔！",
    "有你在，什麼關卡都不怕！",
    "我們是最強搭檔！",
    "下一個任務也要並肩作戰！",
  ],
  4: ["能遇見你真好～", "你是我最信賴的隊長！", "我們的羈絆越來越深了！", "永遠站在你這邊！"],
  5: [
    "最喜歡你了！今天也超棒！",
    "和你在一起的每一天都是冒險！",
    "收到這份心意，我超開心！",
    "我們要一直一起前進喔！",
  ],
};

export function pickFeedLine(bondLevel: number): string {
  const level = Math.min(5, Math.max(1, bondLevel));
  const pool = FEED_LINES_BY_LEVEL[level];
  return pool[Math.floor(Math.random() * pool.length)];
}
