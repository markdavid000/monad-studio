"use client";

import { flowCopy } from "../copy";

const SOURCE_COUNT = 12;
const HUB = { x: 560, y: 190 };
const TONES = [
  "var(--eyebrow)",
  "var(--success)",
  "var(--severity-medium)",
  "var(--severity-critical)",
  "var(--muted-foreground)",
];

const sources = Array.from({ length: SOURCE_COUNT }, (_, index) => {
  const y = 30 + index * 29;
  return {
    y,
    path: `M 72 ${y} C 300 ${y}, 380 ${HUB.y}, ${HUB.x - 34} ${HUB.y}`,
    tone: TONES[index % TONES.length],
    delay: `${-index * 0.7}s`,
  };
});

const beams = [-6, 0, 6].map((offset, index) => ({
  path: `M ${HUB.x + 34} ${HUB.y + offset} C 760 ${HUB.y + offset}, 900 ${HUB.y + offset * 3}, 1120 ${HUB.y + offset * 4}`,
  tone: TONES[index],
  delay: `${-index * 1.2}s`,
}));

export function FlowDiagram() {
  return (
    <svg
      viewBox="0 0 1120 390"
      role="img"
      aria-label={`${flowCopy.sources}, ${flowCopy.hub}, ${flowCopy.target}`}
      className="h-auto w-full"
    >
      {sources.map((source) => (
        <g key={source.y}>
          <rect
            x="40"
            y={source.y - 9}
            width="18"
            height="18"
            rx="4"
            fill="none"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.5"
            strokeWidth="2"
          />
          <path
            d={source.path}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <path
            d={source.path}
            fill="none"
            stroke={source.tone}
            strokeWidth="2.6"
            strokeLinecap="round"
            className="flow-line"
            style={{ animationDelay: source.delay }}
          />
        </g>
      ))}
      {beams.map((beam) => (
        <g key={beam.path}>
          <path
            d={beam.path}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.2"
            strokeWidth="2"
          />
          <path
            d={beam.path}
            fill="none"
            stroke={beam.tone}
            strokeWidth="3.2"
            strokeLinecap="round"
            className="flow-line"
            style={{ animationDelay: beam.delay }}
          />
        </g>
      ))}
      <rect
        x={HUB.x - 34}
        y={HUB.y - 34}
        width="68"
        height="68"
        rx="16"
        fill="var(--card)"
        stroke="var(--eyebrow)"
        strokeWidth="1.5"
      />
      <path
        d={`M ${HUB.x - 15} ${HUB.y + 14} V ${HUB.y - 14} h 6 l 9 13 l 9 -13 h 6 V ${HUB.y + 14} h -6 v -16 l -9 12 l -9 -12 v 16 z`}
        fill="var(--eyebrow)"
      />
      <text x="40" y="376" className="fill-muted-foreground font-mono text-[22px]">
        {flowCopy.sources}
      </text>
      <text
        x={HUB.x}
        y={HUB.y + 66}
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[22px]"
      >
        {flowCopy.hub}
      </text>
      <text
        x="1110"
        y={HUB.y + 52}
        textAnchor="end"
        className="fill-muted-foreground font-mono text-[22px]"
      >
        {flowCopy.target}
      </text>
    </svg>
  );
}
