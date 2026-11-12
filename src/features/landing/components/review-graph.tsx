import { cn } from "@/lib/utils";
import { reviewFlowCopy } from "../copy";

const SIZE = 360;
const CENTER = SIZE / 2;
const RADIUS = 150;
const COUNT = 90;
const GOLDEN = 2.39996;
const MAX_EDGE = 46;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

const nodes = Array.from({ length: COUNT }, (_, index) => {
  const radius = Math.sqrt((index + 0.5) / COUNT) * RADIUS;
  const angle = index * GOLDEN;
  return {
    x: round(CENTER + radius * Math.cos(angle)),
    y: round(CENTER + radius * Math.sin(angle)),
  };
});

const edges = nodes.flatMap((node, index) =>
  [index + 1, index + 8, index + 13, index + 21]
    .filter((target) => target < COUNT)
    .filter((target) => Math.hypot(nodes[target].x - node.x, nodes[target].y - node.y) < MAX_EDGE)
    .map((target) => ({ from: node, to: nodes[target], key: `${index}-${target}` }))
);

const featured = reviewFlowCopy.functions.map((label, index) => {
  const angle = -Math.PI / 2 + (index / reviewFlowCopy.functions.length) * Math.PI * 2;
  return {
    label,
    x: round(CENTER + 108 * Math.cos(angle)),
    y: round(CENTER + 108 * Math.sin(angle)),
  };
});

interface ReviewGraphProps {
  step: number;
}

export function ReviewGraph({ step }: ReviewGraphProps) {
  return (
    <svg
      viewBox={`-40 -10 ${SIZE + 80} ${SIZE + 20}`}
      aria-hidden
      className="h-full w-auto overflow-visible"
    >
      {edges.map((edge) => (
        <line
          key={edge.key}
          x1={edge.from.x}
          y1={edge.from.y}
          x2={edge.to.x}
          y2={edge.to.y}
          stroke="var(--muted-foreground)"
          strokeOpacity="0.18"
          strokeWidth="1"
        />
      ))}
      {nodes.map((node, index) => (
        <circle
          key={index}
          cx={node.x}
          cy={node.y}
          r="3"
          fill="var(--background)"
          stroke="var(--muted-foreground)"
          strokeOpacity="0.4"
        />
      ))}
      <g
        className={cn("transition-opacity duration-700", step === 0 ? "opacity-100" : "opacity-30")}
      >
        {featured.map((point) => (
          <g key={point.label}>
            <line
              x1={CENTER}
              y1={CENTER}
              x2={point.x}
              y2={point.y}
              stroke="var(--foreground)"
              strokeOpacity="0.7"
              strokeWidth="1.2"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="var(--background)"
              stroke="var(--foreground)"
            />
            <text
              x={point.x}
              y={point.y + (point.y > CENTER ? 22 : -14)}
              textAnchor="middle"
              className="fill-foreground font-mono text-[11px]"
            >
              {point.label}
            </text>
          </g>
        ))}
        <circle cx={CENTER} cy={CENTER} r="8" fill="var(--eyebrow)" />
      </g>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS + 14}
        fill="none"
        stroke="var(--success)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        className={cn("transition-opacity duration-700", step >= 1 ? "opacity-100" : "opacity-0")}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS + 6}
        fill="none"
        stroke="var(--eyebrow)"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        className={cn(
          "transition-opacity delay-150 duration-700",
          step >= 1 ? "opacity-100" : "opacity-0"
        )}
      />
    </svg>
  );
}
