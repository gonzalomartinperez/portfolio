type Point = Readonly<{ x: number; y: number }>;
type Bounds = Readonly<{ left: number; top: number; width: number; height: number }>;

const cellsPerAxis = 8;

/** Reduce a point inside stable public bounds to a coarse cell; never retain pixels. */
export function clickCell(point: Point, bounds: Bounds): Point | null {
  if (
    ![point.x, point.y, bounds.left, bounds.top, bounds.width, bounds.height].every(
      Number.isFinite,
    ) ||
    bounds.width <= 0 ||
    bounds.height <= 0
  )
    return null;
  const x = (point.x - bounds.left) / bounds.width;
  const y = (point.y - bounds.top) / bounds.height;
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= 1 || y >= 1) return null;
  return {
    x: Math.min(cellsPerAxis - 1, Math.floor(x * cellsPerAxis)),
    y: Math.min(cellsPerAxis - 1, Math.floor(y * cellsPerAxis)),
  };
}
