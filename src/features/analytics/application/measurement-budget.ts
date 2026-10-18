const windowMilliseconds = 60_000;
const maxPerWindow = 40;
const maxPerDocument = 120;

/** Bound optional measurement attempts with an injected monotonic clock value. */
export function createMeasurementBudget() {
  let recent: number[] = [];
  let total = 0;
  let latest = -1;
  return {
    take(now: number): boolean {
      if (!Number.isFinite(now) || now < 0 || now < latest) return false;
      latest = now;
      recent = recent.filter((time) => now - time < windowMilliseconds);
      if (total >= maxPerDocument || recent.length >= maxPerWindow) return false;
      recent.push(now);
      total += 1;
      return true;
    },
  };
}
