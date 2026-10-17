/** Drawing-buffer scale steps; small steps keep each change subtle. */
export const qualitySteps = [1, 0.86, 0.74, 0.62] as const;
const lowest = qualitySteps.length - 1;
const defaultRefreshMs = 1000 / 60;

/**
 * Adaptive resolution for one render loop. It calibrates the display refresh from RAF, compares
 * measured frame intervals with it, steps down on sustained missed frames and recovers after a
 * stable period. A level that fails right after an upgrade is not retried for a while, which
 * prevents oscillation. `onChange` runs whenever the level changes.
 */
export function createQualityController({
  initialLevel,
  onChange,
}: {
  initialLevel: number;
  onChange(): void;
}) {
  let level = initialLevel;
  let refreshMs = defaultRefreshMs;
  const intervals: number[] = [];
  let sampledMs = 0;
  /** Samples before this time are ignored (startup, uploads, resizes). */
  let samplesFrom = performance.now() + 1500;
  let lastChange = 0;
  let upgrade = { level: -1, time: 0 };
  const blockedUntil = new Map<number, number>();

  let calibrationFrame = 0;
  let calibrationTime = 0;
  let calibrationAttempts = 0;
  const calibration: number[] = [];
  const calibrate = (time: number) => {
    calibrationFrame = 0;
    if (document.hidden) return;
    if (calibrationTime) {
      const interval = time - calibrationTime;
      if (interval >= 4 && interval <= 40) calibration.push(interval);
    }
    calibrationTime = time;
    calibrationAttempts++;
    if (calibration.length < 16 && calibrationAttempts < 60)
      calibrationFrame = requestAnimationFrame(calibrate);
    else if (calibration.length >= 4) {
      calibration.sort((a, b) => a - b);
      refreshMs = calibration[Math.floor(calibration.length / 3)];
    }
  };

  const evaluate = (now: number) => {
    const sorted = [...intervals].sort((a, b) => a - b);
    intervals.length = 0;
    sampledMs = 0;
    const typical = sorted[Math.floor(sorted.length * 0.5)];
    const slow = sorted[Math.floor(sorted.length * 0.85)];
    const overloaded = typical > refreshMs * 1.4 || slow > refreshMs * 2.2;
    if (overloaded && level < lowest && now - lastChange > 1200) {
      if (upgrade.level === level && now - upgrade.time < 4000)
        blockedUntil.set(level, now + 90_000);
      // Software rendering can be several times too slow; stepping gradually would take minutes.
      level = typical > refreshMs * 4 ? lowest : level + 1;
      lastChange = now;
      onChange();
    } else if (
      !overloaded &&
      level > 0 &&
      slow < refreshMs * 1.15 &&
      now - lastChange > 9000 &&
      (blockedUntil.get(level - 1) ?? 0) < now
    ) {
      level--;
      lastChange = now;
      upgrade = { level, time: now };
      onChange();
    }
  };

  return {
    get scale() {
      return qualitySteps[level];
    },
    get level() {
      return level;
    },
    get refreshMs() {
      return refreshMs;
    },
    /** Starts or resumes refresh calibration until enough intervals are measured. */
    calibrate() {
      if (calibrationFrame || calibration.length >= 4) return;
      calibrationTime = 0;
      calibrationAttempts = 0;
      calibrationFrame = requestAnimationFrame(calibrate);
    },
    /** One-off stalls (uploads, resizes) are not evidence of sustained overload. */
    discard(milliseconds: number) {
      intervals.length = 0;
      sampledMs = 0;
      samplesFrom = Math.max(samplesFrom, performance.now() + milliseconds);
    },
    /** Records one frame interval; decides after 60 frames or one second, whichever comes first. */
    sample(time: number, intervalMs: number) {
      if (time < samplesFrom) return;
      intervals.push(intervalMs);
      sampledMs += intervalMs;
      if (intervals.length >= 60 || (intervals.length >= 4 && sampledMs > 1000)) evaluate(time);
    },
    dispose() {
      cancelAnimationFrame(calibrationFrame);
      calibrationFrame = 0;
    },
  };
}
