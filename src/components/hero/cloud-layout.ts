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

/** Preserve the organic ellipse while fitting measured marks around centered copy. */
export function layoutCloud(bounds: CloudBounds) {
  const { width, height, top, bottom, markWidth, markHeight, copyWidth, copyHeight, count } =
    bounds;
  const positions: Position[] = [];
  if (count <= 0) return { scale: 1, positions };

  for (let step = 0; step < 24; step += 1) {
    const scale = 1 - step * 0.04;
    const scaledWidth = markWidth * scale;
    const scaledHeight = markHeight * scale;
    const radiusX = (width - scaledWidth) / 2 - 12;
    const minY = -height / 2 + top + scaledHeight / 2 + 8;
    const maxY = height / 2 - bottom - scaledHeight / 2 - 8;
    const radiusY = (maxY - minY) / 2;
    if (radiusX <= 0 || radiusY <= 0) continue;

    const centerY = (minY + maxY) / 2;
    const copyClearanceX = (copyWidth + scaledWidth) / 2 + 12;
    const copyClearanceY = (copyHeight + scaledHeight) / 2 + 12;
    const seed = (index: number, total: number): Position => {
      const angle = index * goldenAngle;
      const radius = 0.5 + 0.48 * Math.sqrt((index + 1) / total);
      return {
        x: Math.cos(angle) * radiusX * radius,
        y: centerY + Math.sin(angle) * radiusY * radius,
      };
    };
    const sampleCount = Math.min(4096, Math.max(1024, count * 64));
    const candidates = Array.from({ length: sampleCount }, (_, index) => seed(index, sampleCount));
    positions.length = 0;

    const fits = ({ x, y }: Position) =>
      !(Math.abs(x) < copyClearanceX && Math.abs(y) < copyClearanceY) &&
      positions.every(
        (other) =>
          Math.abs(x - other.x) >= scaledWidth + 6 || Math.abs(y - other.y) >= scaledHeight + 6,
      );

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
