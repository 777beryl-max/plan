import type { CompanionMood } from "@/lib/types";

interface MoodBadgeProps {
  mood: CompanionMood;
  size?: number;
}

function IdleFace() {
  return (
    <>
      <circle cx="8.5" cy="10" r="1.6" fill="#5bb5d6" />
      <circle cx="15.5" cy="10" r="1.6" fill="#5bb5d6" />
      <path
        d="M8 14.5 Q12 17.5 16 14.5"
        fill="none"
        stroke="#4a3728"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  );
}

function HappyFace() {
  return (
    <>
      <ellipse cx="7.5" cy="11" rx="2" ry="1.2" fill="#ffb3c6" opacity="0.85" />
      <ellipse cx="16.5" cy="11" rx="2" ry="1.2" fill="#ffb3c6" opacity="0.85" />
      <path
        d="M7 9.5 Q8.5 8 10 9.5"
        fill="none"
        stroke="#4a3728"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14 9.5 Q15.5 8 17 9.5"
        fill="none"
        stroke="#4a3728"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M7.5 14 Q12 18 16.5 14"
        fill="none"
        stroke="#4a3728"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  );
}

function CheeringFace() {
  return (
    <>
      <path
        d="M8 7.5 L8.6 9.2 L10.4 9.2 L9 10.3 L9.6 12 L8 11 L6.4 12 L7 10.3 L5.6 9.2 L7.4 9.2 Z"
        fill="#ffe066"
      />
      <path
        d="M16 7.5 L16.6 9.2 L18.4 9.2 L17 10.3 L17.6 12 L16 11 L14.4 12 L15 10.3 L13.6 9.2 L15.4 9.2 Z"
        fill="#ffe066"
      />
      <ellipse cx="12" cy="15.8" rx="3.2" ry="2.4" fill="#ff8fab" />
      <ellipse cx="12" cy="15" rx="2.3" ry="1.3" fill="#fff5f8" />
      <path
        d="M9 12.2 Q12 10.5 15 12.2"
        fill="none"
        stroke="#4a3728"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </>
  );
}

function SleepyFace() {
  return (
    <>
      <path d="M6.5 10 H10" stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 10 H17.5" stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="12" cy="14.5" rx="1.2" ry="1.5" fill="#4a3728" />
      <text x="15" y="8" fontSize="5" fill="#9b8ec4" fontWeight="700">
        z
      </text>
      <text x="17" y="6" fontSize="4" fill="#b8a9e8" fontWeight="700">
        z
      </text>
    </>
  );
}

const MOOD_FACES: Record<CompanionMood, () => React.JSX.Element> = {
  idle: IdleFace,
  happy: HappyFace,
  cheering: CheeringFace,
  sleepy: SleepyFace,
};

/** 夥伴心情徽章：向量表情，小尺寸也清楚可辨 */
export function MoodBadge({ mood, size = 24 }: MoodBadgeProps) {
  const Face = MOOD_FACES[mood];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className="block adventure-mood-face"
    >
      <circle cx="12" cy="12" r="11" fill="#fffef9" />
      <Face />
    </svg>
  );
}

export const MOOD_LABELS: Record<CompanionMood, string> = {
  sleepy: "想睡覺",
  idle: "普通",
  happy: "開心",
  cheering: "超棒",
};
