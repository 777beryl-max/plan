const FOCUS_BLESSINGS = [
  "加油！每一分鐘都在靠近目標 ✨",
  "專注的勇者，今天也在書寫傳奇！",
  "相信自己，這場副本你一定能贏 🏆",
  "靜下心來，勝利就在前方等你",
  "願專注帶給你力量，一步步征服關卡！",
  "此刻的堅持，會成為未來的榮耀 ⭐",
];

const BREAK_BLESSINGS = [
  "好好休息，補充體力後再出發吧 ☁️",
  "喘口氣也是冒險的一部分，你做得很好～",
  "願這段休息帶給你滿滿的能量 🌿",
  "短暫停歇，是為了走更遠的路",
  "放鬆一下，夥伴也在為你加油！",
];

const WEEK_BLESSING_TEMPLATES = [
  (stage: string) => `${stage}的旅程已展開，願你步步向前、收穫滿滿！`,
  (stage: string) => `勇敢踏上本週的冒險吧！${stage}每一天都是新的關卡 ✨`,
  (stage: string) => `願你在${stage}收穫成長與喜悅，加油！`,
  (stage: string) => `${stage}的關卡等你挑戰，相信自己一定做得到 💪`,
  (stage: string) => `本週${stage}，願你帶著勇氣與溫柔前進 🌟`,
];

function daySeed(date: Date): number {
  return date.getFullYear() * 1000 + date.getMonth() * 31 + date.getDate();
}

function pickFromPool<T>(pool: T[], seed: number): T {
  return pool[seed % pool.length];
}

export function getFocusBlessing(phase: "focus" | "break", date = new Date()): string {
  const pool = phase === "break" ? BREAK_BLESSINGS : FOCUS_BLESSINGS;
  return pickFromPool(pool, daySeed(date) + (phase === "break" ? 7 : 0));
}

export function getWeekGoalBlessing(stageLabel: string, date = new Date()): string {
  const template = pickFromPool(WEEK_BLESSING_TEMPLATES, daySeed(date) + stageLabel.length);
  return template(stageLabel);
}
