export const FLOW_WIDTH = 1600;
export const FLOW_HEIGHT = 500;
export const FLOW_WALL = 780;

const MID = FLOW_HEIGHT / 2;
const WIRE_COUNT = 10;
const WIRE_GAP = 7;
const STOPS_PER_ICON = 4;
const ICON_HALF = 14;
const AREA = { left: 70, right: 430, top: 55, bottom: 445 };

export interface Point {
  x: number;
  y: number;
}

export interface Wire {
  key: string;
  tone: number;
  stops: readonly Point[];
  paths: readonly string[];
  begin: string;
  pulseDelay: string;
}

function random(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function wirePath(icon: Point, lane: number) {
  const startX = icon.x + ICON_HALF + 2;
  const reach = FLOW_WALL - startX;
  const exit = MID + (lane - MID) * 0.45;
  return [
    `M ${round(startX)} ${round(icon.y)}`,
    `C ${round(startX + reach * 0.55)} ${round(icon.y)}, ${round(FLOW_WALL - reach * 0.35)} ${lane}, ${FLOW_WALL} ${lane}`,
    `C ${FLOW_WALL + 320} ${lane}, ${FLOW_WIDTH - 420} ${round(exit)}, ${FLOW_WIDTH} ${round(exit)}`,
  ].join(" ");
}

function iconStops(index: number): Point[] {
  const rowHeight = (AREA.bottom - AREA.top) / WIRE_COUNT;
  return Array.from({ length: STOPS_PER_ICON }, (_, stop) => {
    const jitter = random(index * 31 + stop * 7) - 0.5;
    const spread = (stop + random(index * 17 + stop * 5)) / STOPS_PER_ICON;
    const column = (spread + index * 0.37) % 1;
    return {
      x: round(AREA.left + column * (AREA.right - AREA.left)),
      y: round(AREA.top + (index + 0.5) * rowHeight + jitter * rowHeight * 0.9),
    };
  });
}

export function buildWires(toneCount: number, cycleSeconds: number): Wire[] {
  return Array.from({ length: WIRE_COUNT }, (_, index) => {
    const lane = MID - ((WIRE_COUNT - 1) * WIRE_GAP) / 2 + index * WIRE_GAP;
    const stops = iconStops(index);
    return {
      key: `wire-${index}`,
      tone: index % toneCount,
      stops,
      paths: stops.map((stop) => wirePath(stop, lane)),
      begin: `${round(-(index * cycleSeconds) / WIRE_COUNT)}s`,
      pulseDelay: `${round(-((index * 7) % WIRE_COUNT) * 0.27)}s`,
    };
  });
}

export function loopValues<T>(stops: readonly T[]) {
  return [...stops.flatMap((stop) => [stop, stop]), stops[0]];
}

export function loopKeyTimes(count: number, hold = 0.7) {
  const slot = 1 / count;
  const times = Array.from({ length: count }, (_, index) => [
    index * slot,
    index * slot + slot * hold,
  ]).flat();
  return [...times, 1].map((time) => round(time * 1000) / 1000).join(";");
}
