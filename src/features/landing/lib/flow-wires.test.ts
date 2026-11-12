import { describe, expect, it } from "vitest";
import {
  FLOW_WALL,
  FLOW_WIDTH,
  buildWires,
  loopKeyTimes,
  loopValues,
  wirePath,
} from "./flow-wires";

function numbers(path: string) {
  return path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
}

describe("flow wires", () => {
  it("runs each wire from its icon through the hub to the right edge", () => {
    const path = wirePath({ x: 100, y: 80 }, 240);
    const values = numbers(path);
    expect(values.slice(0, 2)).toEqual([116, 80]);
    expect(values.slice(6, 8)).toEqual([FLOW_WALL, 240]);
    expect(values.at(-2)).toBe(FLOW_WIDTH);
  });

  it("keeps every wire's path shape the same so it can morph between stops", () => {
    for (const wire of buildWires(4, 18)) {
      const shapes = wire.paths.map((path) => path.replace(/-?\d+(\.\d+)?/g, "n"));
      expect(new Set(shapes).size).toBe(1);
      expect(wire.paths).toHaveLength(wire.stops.length);
    }
  });

  it("gives each wire its own lane at the hub and moves its icon between distinct stops", () => {
    const wires = buildWires(4, 18);
    const lanes = wires.map((wire) => numbers(wire.paths[0])[7]);
    expect(new Set(lanes).size).toBe(wires.length);
    for (const wire of wires) {
      const spots = wire.stops.map((stop) => `${stop.x},${stop.y}`);
      expect(new Set(spots).size).toBe(spots.length);
    }
  });

  it("keeps the icons in lane order so wires do not cross on the left", () => {
    const wires = buildWires(4, 18);
    for (let stop = 0; stop < wires[0].stops.length; stop += 1) {
      const ys = wires.map((wire) => wire.stops[stop].y);
      expect(ys).toEqual([...ys].sort((a, b) => a - b));
    }
  });

  it("holds at each stop and loops back to the first", () => {
    expect(loopValues(["a", "b"])).toEqual(["a", "a", "b", "b", "a"]);
    expect(loopKeyTimes(2, 0.5)).toBe("0;0.25;0.5;0.75;1");
  });
});
