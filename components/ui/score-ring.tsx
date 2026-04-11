"use client";

import { cn } from "@/lib/utils";

function getScoreColor(score: number): string {
  if (score >= 80) return "#00E5A0"; // success
  if (score >= 60) return "#FFB547"; // warning
  if (score >= 40) return "#836EF9"; // monad
  return "#FF4D6A"; // danger
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

export function ScoreRing({
  score,
  size = 120,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1E1E30"
          strokeWidth={8}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            transition: "stroke-dashoffset 1s ease",
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-display font-bold"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs font-mono text-ink-faint">{label}</span>
      </div>
    </div>
  );
}
