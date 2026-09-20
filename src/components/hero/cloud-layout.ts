type CloudBounds = {
  width: number;
  height: number;
  top: number;
  bottom: number;
  markWidth: number;
  markHeight: number;
  copyWidth: number;
  copyHeight: number;
  count: number;
};

type Position = { x: number; y: number };

const goldenAngle = 2.399963;

export const cloudEntrance = { start: 0.55, stagger: 0.12, duration: 0.13, offset: 80 };

// Find a shared time interval where all three linear separation distances are negative.
function overlapsDuringSegment(start: number[], end: number[]) {
  let from = 0;
  let to = 1;
  for (let axis = 0; axis < start.length; axis += 1) {
    const slope = end[axis] - start[axis];
    if (slope === 0) {
      if (start[axis] >= 0) return false;
      continue;
    }
    const crossing = -start[axis] / slope;
    if (slope > 0) to = Math.min(to, crossing);
    else from = Math.max(from, crossing);
    if (from >= to) return false;
  }
  return from < to;
}

/** Preserve the organic ellipse while fitting measured marks around centered copy. */
export function layoutCloud(bounds: CloudBounds) {
  const { width, height, top, bottom, markWidth, markHeight, copyWidth, copyHeight, count } =
    bounds;
  const positions: Position[] = [];
  if (count <= 0) return { scale: 1, positions };
  // Pair motion changes slope at earlier start, later start, earlier end and later end.
  const entrancePairs = Array.from({ length: count }, (_, difference) => {
    const delay = Math.min(
      1,
      (difference * cloudEntrance.stagger) / (count * cloudEntrance.duration),
    );
    return [
      { size: 0.5, travel: 0 },
      { size: 0.5 + delay * 0.25, travel: delay * cloudEntrance.offset },
      { size: 1 - delay * 0.25, travel: delay * cloudEntrance.offset },
      { size: 1, travel: 0 },
    ];
  });

  for (let step = 0; step < 24; step += 1) {
    const scale = 1 - step * 0.04;
    const scaledWidth = markWidth * scale;
    const scaledHeight = markHeight * scale;
    const radiusX = (width - scaledWidth) / 2 - 12;
    const minY = -height / 2 + top + scaledHeight / 2 + 8;
    const maxY = height / 2 - bottom - scaledHeight / 4 - 8 - cloudEntrance.offset;
    const radiusY = (maxY - minY) / 2;
    if (radiusX <= 0 || radiusY <= 0) continue;

    const centerY = (minY + maxY) / 2;
    const seed = (index: number, total: number): Position => {
      const angle = index * goldenAngle;
      const radius = 0.5 + 0.48 * Math.sqrt((index + 1) / total);
      return {
        x: Math.cos(angle) * radiusX * radius,
        y: centerY + Math.sin(angle) * radiusY * radius,
      };
    };
    const sampleCount = Math.min(2048, Math.max(512, count * 32));
    const candidates = Array.from({ length: sampleCount }, (_, index) => seed(index, sampleCount));
    positions.length = 0;

    const fits = ({ x, y }: Position) => {
      const copyDistances = (reveal: number) => {
        const size = 0.5 + reveal * 0.5;
        const center = y + cloudEntrance.offset * (1 - reveal);
        const halfHeight = (copyHeight + scaledHeight * size) / 2 + 12;
        return [
          Math.abs(x) - (copyWidth + scaledWidth * size) / 2 - 12,
          center - halfHeight,
          -center - halfHeight,
        ];
      };
      if (overlapsDuringSegment(copyDistances(0), copyDistances(1))) return false;
      return positions.every((other, otherIndex) => {
        const states = entrancePairs[positions.length - otherIndex];
        const relativeTravel = states[1].travel;
        if (
          Math.abs(x - other.x) >= scaledWidth + 6 ||
          y - other.y >= scaledHeight + 6 ||
          y - other.y + relativeTravel <= -scaledHeight - 6
        )
          return true;
        const distances = ({ size, travel }: { size: number; travel: number }) => {
          const deltaY = y - other.y + travel;
          return [
            Math.abs(x - other.x) - scaledWidth * size - 6,
            deltaY - scaledHeight * size - 6,
            -deltaY - scaledHeight * size - 6,
          ];
        };
        for (let segment = 0; segment < states.length - 1; segment += 1) {
          if (overlapsDuringSegment(distances(states[segment]), distances(states[segment + 1])))
            return false;
        }
        return true;
      });
    };

    for (let index = 0; index < count; index += 1) {
      const preferred = seed(index, count);
      if (fits(preferred)) {
        positions.push(preferred);
        continue;
      }
      let nearest: Position | undefined;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (const candidate of candidates) {
        const distance = (candidate.x - preferred.x) ** 2 + (candidate.y - preferred.y) ** 2;
        if (distance >= nearestDistance || !fits(candidate)) continue;
        nearest = candidate;
        nearestDistance = distance;
      }
      if (!nearest) break;
      positions.push(nearest);
    }
    if (positions.length === count) return { scale, positions };
  }

  // Impossible geometry stays non-disruptive; the native toolkit remains available.
  return { scale: 0, positions: Array.from({ length: count }, () => ({ x: 0, y: 0 })) };
}
