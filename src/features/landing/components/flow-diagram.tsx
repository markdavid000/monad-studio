"use client";

import { flowCopy } from "../copy";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import {
  FLOW_HEIGHT,
  FLOW_WALL,
  FLOW_WIDTH,
  buildWires,
  loopKeyTimes,
  loopValues,
} from "../lib/flow-wires";

const TONES = [
  "var(--success)",
  "var(--severity-critical)",
  "var(--severity-medium)",
  "var(--eyebrow)",
];
const CYCLE_SECONDS = 18;
const wires = buildWires(TONES.length, CYCLE_SECONDS);
const STOP_COUNT = wires[0]?.stops.length ?? 1;
const KEY_TIMES = loopKeyTimes(STOP_COUNT);
const KEY_SPLINES = Array.from({ length: STOP_COUNT * 2 }, () => "0.45 0 0.2 1").join(";");
const timing = {
  dur: `${CYCLE_SECONDS}s`,
  repeatCount: "indefinite",
  calcMode: "spline",
  keyTimes: KEY_TIMES,
  keySplines: KEY_SPLINES,
} as const;

export function FlowDiagram() {
  const isStill = useReducedMotion();

  return (
    <svg
      viewBox={`0 0 ${FLOW_WIDTH} ${FLOW_HEIGHT}`}
      role="img"
      aria-label={`${flowCopy.sources}, ${flowCopy.hub}, ${flowCopy.target}`}
      className="h-auto w-full"
    >
      <defs>
        {TONES.map((tone, index) => (
          <linearGradient
            key={tone}
            id={`flow-wire-${index}`}
            gradientUnits="userSpaceOnUse"
            x1="60"
            x2={FLOW_WIDTH}
          >
            <stop offset="0" stopColor={tone} stopOpacity="0.15" />
            <stop offset="0.45" stopColor={tone} stopOpacity="0.85" />
            <stop offset="0.8" stopColor={tone} stopOpacity="0.5" />
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
          <rect
            x="0"
            y="0"
            width={FLOW_WALL - 140}
            height={FLOW_HEIGHT}
            fill="url(#flow-grid-fade)"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width={FLOW_WALL - 140}
        height={FLOW_HEIGHT}
        fill="url(#flow-grid)"
        mask="url(#flow-grid-mask)"
      />
      {wires.map((wire) => (
        <g key={wire.key} data-wire>
          <path
            d={wire.paths[0]}
            fill="none"
            stroke={`url(#flow-wire-${wire.tone})`}
            strokeWidth="1.6"
          >
            {isStill ? null : (
              <animate
                attributeName="d"
                values={loopValues(wire.paths).join(";")}
                begin={wire.begin}
                {...timing}
              />
            )}
          </path>
          <path
            d={wire.paths[0]}
            fill="none"
            stroke={TONES[wire.tone]}
            strokeWidth="2.6"
            strokeLinecap="round"
            className="flow-pulse"
            style={{ animationDelay: wire.pulseDelay }}
          >
            {isStill ? null : (
              <animate
                attributeName="d"
                values={loopValues(wire.paths).join(";")}
                begin={wire.begin}
                {...timing}
              />
            )}
          </path>
        </g>
      ))}
      {wires.map((wire) => (
        <g
          key={`icon-${wire.key}`}
          transform={`translate(${wire.stops[0].x - 14} ${wire.stops[0].y - 14})`}
        >
          {isStill ? null : (
            <animateTransform
              attributeName="transform"
              type="translate"
              values={loopValues(wire.stops)
                .map((stop) => `${stop.x - 14} ${stop.y - 14}`)
                .join(";")}
              begin={wire.begin}
              {...timing}
            />
          )}
          <g className="flow-icon" style={{ animationDelay: wire.begin }}>
            <rect
              width="28"
              height="28"
              rx="6"
              fill="var(--card)"
              stroke="var(--muted-foreground)"
              strokeOpacity="0.7"
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
        </g>
      ))}
      <line
        x1={FLOW_WALL}
        x2={FLOW_WALL}
        y1="90"
        y2={FLOW_HEIGHT - 90}
        stroke="url(#flow-wall)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
