import type { Point } from "./enterprise-architecture-layout";

type Box = Point & { width: number; height: number };
export type Port = "top" | "right" | "bottom" | "left";
const clearance = 10;
const inside = (point: Point, box: Box) =>
  point.x > box.x - clearance &&
  point.x < box.x + box.width + clearance &&
  point.y > box.y - clearance &&
  point.y < box.y + box.height + clearance;
function segmentBlocked(a: Point, b: Point, boxes: Box[]) {
  return boxes.some((box) =>
    a.x === b.x
      ? a.x > box.x - clearance &&
        a.x < box.x + box.width + clearance &&
        Math.max(a.y, b.y) > box.y - clearance &&
        Math.min(a.y, b.y) < box.y + box.height + clearance
      : a.y > box.y - clearance &&
        a.y < box.y + box.height + clearance &&
        Math.max(a.x, b.x) > box.x - clearance &&
        Math.min(a.x, b.x) < box.x + box.width + clearance,
  );
}
function portPoint(box: Box, port: Port, lead = 0): Point {
  if (port === "top") return { x: box.x + box.width / 2, y: box.y - lead };
  if (port === "bottom") return { x: box.x + box.width / 2, y: box.y + box.height + lead };
  if (port === "left") return { x: box.x - lead, y: box.y + box.height / 2 };
  return { x: box.x + box.width + lead, y: box.y + box.height / 2 };
}

// Route on the clear lanes between measured-size cards, never through another card.
export function routeConnection(
  sourceId: string,
  targetId: string,
  positions: Record<string, Point>,
  width: number,
  height: number,
) {
  const boxes = Object.fromEntries(
    Object.entries(positions).map(([id, position]) => [id, { ...position, width, height }]),
  );
  const source = boxes[sourceId];
  const target = boxes[targetId];
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const horizontal = Math.abs(dx) > Math.abs(dy);
  const sourcePort: Port = horizontal ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";
  const targetPort: Port = horizontal ? (dx > 0 ? "left" : "right") : dy > 0 ? "top" : "bottom";
  const start = portPoint(source, sourcePort, clearance + 4);
  const end = portPoint(target, targetPort, clearance + 4);
  const obstacles = Object.values(boxes);
  const xs = [
    ...new Set([
      start.x,
      end.x,
      ...obstacles.flatMap((box) => [box.x - clearance - 4, box.x + width + clearance + 4]),
    ]),
  ].sort((a, b) => a - b);
  const ys = [
    ...new Set([
      start.y,
      end.y,
      ...obstacles.flatMap((box) => [box.y - clearance - 4, box.y + height + clearance + 4]),
    ]),
  ].sort((a, b) => a - b);
  const columns = xs.length;
  const index = (point: Point) => ys.indexOf(point.y) * columns + xs.indexOf(point.x);
  const origin = index(start);
  const destination = index(end);
  const distances = new Map<number, number>([[origin, 0]]);
  const previous = new Map<number, number>();
  const pending = new Set<number>([origin]);
  const point = (id: number) => ({ x: xs[id % columns], y: ys[Math.floor(id / columns)] });
  while (pending.size) {
    let current = -1;
    let best = Number.POSITIVE_INFINITY;
    for (const candidate of pending) {
      const cost = distances.get(candidate) ?? Number.POSITIVE_INFINITY;
      const p = point(candidate);
      const score = cost + Math.abs(p.x - end.x) + Math.abs(p.y - end.y);
      if (score < best) {
        best = score;
        current = candidate;
      }
    }
    if (current === destination) break;
    pending.delete(current);
    const column = current % columns;
    const row = Math.floor(current / columns);
    const adjacent = [
      column > 0 ? current - 1 : -1,
      column + 1 < columns ? current + 1 : -1,
      row > 0 ? current - columns : -1,
      row + 1 < ys.length ? current + columns : -1,
    ];
    const a = point(current);
    for (const next of adjacent) {
      if (next < 0) continue;
      const b = point(next);
      if (obstacles.some((box) => inside(b, box)) || segmentBlocked(a, b, obstacles)) continue;
      const cost = (distances.get(current) ?? 0) + Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      if (cost >= (distances.get(next) ?? Number.POSITIVE_INFINITY)) continue;
      distances.set(next, cost);
      previous.set(next, current);
      pending.add(next);
    }
  }
  if (!distances.has(destination))
    throw new Error(`No clear architecture route: ${sourceId} → ${targetId}`);
  const path = [end];
  let cursor = destination;
  while (cursor !== origin) {
    const parent = previous.get(cursor);
    if (parent === undefined) throw new Error("Incomplete architecture route");
    cursor = parent;
    path.unshift(point(cursor));
  }
  const points = [portPoint(source, sourcePort), ...path, portPoint(target, targetPort)];
  const simplified = points.filter((p, index) => {
    const before = points[index - 1];
    const after = points[index + 1];
    return (
      !before ||
      !after ||
      !((before.x === p.x && p.x === after.x) || (before.y === p.y && p.y === after.y))
    );
  });
  return { sourcePort, targetPort, points: simplified };
}

export function roundedRoute(points: Point[], scale: number) {
  const scaled = points.map((p) => ({ x: p.x * scale, y: p.y * scale }));
  let path = `M ${scaled[0].x},${scaled[0].y}`;
  for (let index = 1; index < scaled.length; index++) {
    const current = scaled[index];
    const next = scaled[index + 1];
    if (!next) {
      path += ` L ${current.x},${current.y}`;
      continue;
    }
    const previous = scaled[index - 1];
    const radius = Math.min(
      8 * scale,
      Math.hypot(current.x - previous.x, current.y - previous.y) / 2,
      Math.hypot(next.x - current.x, next.y - current.y) / 2,
    );
    const before = {
      x: current.x - Math.sign(current.x - previous.x) * radius,
      y: current.y - Math.sign(current.y - previous.y) * radius,
    };
    const after = {
      x: current.x + Math.sign(next.x - current.x) * radius,
      y: current.y + Math.sign(next.y - current.y) * radius,
    };
    path += ` L ${before.x},${before.y} Q ${current.x},${current.y} ${after.x},${after.y}`;
  }
  return path;
}
