"use client";

import { flowCopy } from "../copy";

const WIDTH = 1600;
const HEIGHT = 500;
const MID = HEIGHT / 2;
const WALL = 780;
const TONES = [
  "var(--success)",
  "var(--severity-critical)",
  "var(--severity-medium)",
  "var(--eyebrow)",
];

const COLUMNS = [90, 150, 210, 270, 330];
const ROWS = [70, 125, 180, 235, 290, 345, 400];

const icons = ROWS.flatMap((y, row) =>
  COLUMNS.map((x, column) => ({ x, y, seed: (row * 7 + column * 13) % 11 }))
).filter((icon) => icon.seed % 3 !== 0);

const sources = icons
  .filter((icon) => icon.seed % 2 === 0)
  .slice(0, 10)
  .map((icon, index) => {
    const target = MID - 60 + index * 13;
    return {
      key: `${icon.x}-${icon.y}`,
      path: `M ${icon.x + 16} ${icon.y} C ${WALL - 300} ${icon.y}, ${WALL - 220} ${target}, ${WALL} ${target}`,
      tone: index % TONES.length,
      delay: `${-index * 0.9}s`,
      duration: `${5 + (index % 4)}s`,
    };
  });

const bundle = [-6, -3, 0, 3, 6].map((offset, index) => ({
  key: offset,
  path: `M ${WALL} ${MID + offset} C ${WALL + 300} ${MID + offset}, ${WALL + 520} ${MID + offset * 0.4}, ${WIDTH} ${MID + offset * 0.3}`,
  tone: index % TONES.length,
  delay: `${-index * 1.3}s`,
}));

export function FlowDiagram() {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`${flowCopy.sources}, ${flowCopy.hub}, ${flowCopy.target}`}
      className="h-auto w-full"
    >
      <defs>
        {TONES.map((tone, index) => (
          <linearGradient
            key={`in-${tone}`}
            id={`flow-in-${index}`}
            gradientUnits="userSpaceOnUse"
            x1="100"
            x2={WALL}
          >
            <stop offset="0" stopColor={tone} stopOpacity="0" />
            <stop offset="0.55" stopColor={tone} stopOpacity="0.35" />
            <stop offset="1" stopColor={tone} stopOpacity="0.9" />
          </linearGradient>
        ))}
        {TONES.map((tone, index) => (
          <linearGradient
            key={`out-${tone}`}
            id={`flow-out-${index}`}
            gradientUnits="userSpaceOnUse"
            x1={WALL}
            x2={WIDTH}
          >
            <stop offset="0" stopColor={tone} stopOpacity="0.95" />
            <stop offset="0.7" stopColor={tone} stopOpacity="0.45" />
            <stop offset="1" stopColor={tone} stopOpacity="0" />
          </linearGradient>
        ))}
        <linearGradient id="flow-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--muted-foreground)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--muted-foreground)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--muted-foreground)" stopOpacity="0" />
        </linearGradient>
        <pattern id="flow-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--border)" strokeWidth="1" />
        </pattern>
        <radialGradient id="flow-grid-fade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="white" stopOpacity="0.9" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="flow-grid-mask">
          <rect x="0" y="0" width={WALL - 140} height={HEIGHT} fill="url(#flow-grid-fade)" />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width={WALL - 140}
        height={HEIGHT}
        fill="url(#flow-grid)"
        mask="url(#flow-grid-mask)"
      />
      {sources.map((source) => (
        <g key={source.key}>
          <path
            d={source.path}
            fill="none"
            stroke={`url(#flow-in-${source.tone})`}
            strokeWidth="1.6"
          />
          <path
            d={source.path}
            fill="none"
            stroke={TONES[source.tone]}
            strokeWidth="2.4"
            strokeLinecap="round"
            className="flow-pulse"
            style={{ animationDelay: source.delay, animationDuration: source.duration }}
          />
        </g>
      ))}
      {icons.map((icon) => {
        const isLinked = sources.some((source) => source.key === `${icon.x}-${icon.y}`);
        return (
          <g
            key={`${icon.x}-${icon.y}`}
            transform={`translate(${icon.x - 14} ${icon.y - 14})`}
            className={isLinked ? "flow-icon" : undefined}
            style={isLinked ? { animationDelay: `${-icon.seed * 0.6}s` } : undefined}
            opacity={isLinked ? 1 : 0.35}
          >
            <rect
              width="28"
              height="28"
              rx="6"
              fill="var(--card)"
              stroke="var(--muted-foreground)"
              strokeOpacity={isLinked ? 0.7 : 0.4}
              strokeWidth="1.2"
            />
            <path
              d="M 11 10 l -4 4 l 4 4 M 17 10 l 4 4 l -4 4"
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      <line
        x1={WALL}
        x2={WALL}
        y1="90"
        y2={HEIGHT - 90}
        stroke="url(#flow-wall)"
        strokeWidth="1.5"
      />
      {bundle.map((line) => (
        <g key={line.key}>
          <path
            d={line.path}
            fill="none"
            stroke={`url(#flow-out-${line.tone})`}
            strokeWidth="1.8"
          />
          <path
            d={line.path}
            fill="none"
            stroke={TONES[line.tone]}
            strokeWidth="2.6"
            strokeLinecap="round"
            className="flow-pulse flow-pulse-long"
            style={{ animationDelay: line.delay }}
          />
        </g>
      ))}
    </svg>
  );
}
