type ClockPort = {
  schedule(callback: () => void, delay: number): number;
  cancel(timer: number): void;
  isEligible(key: string): boolean;
  emit(key: string): void;
};

const dwellMilliseconds = 500;
const maxTrackedKeys = 96;

/** Document-local qualification; callers supply reviewed keys and current visibility. */
export function createExposureDwell(port: ClockPort) {
  const qualified = new Set<string>();
  const pending = new Map<string, { timer?: number }>();

  function remove(key: string) {
    const ticket = pending.get(key);
    pending.delete(key);
    if (ticket?.timer !== undefined) port.cancel(ticket.timer);
  }

  function pause() {
    for (const key of pending.keys()) remove(key);
  }

  return {
    observe(key: string, eligible: boolean) {
      if (!eligible) {
        remove(key);
        return;
      }
      if (qualified.has(key) || pending.has(key) || qualified.size + pending.size >= maxTrackedKeys)
        return;
      const ticket: { timer?: number } = {};
      pending.set(key, ticket);
      ticket.timer = port.schedule(() => {
        if (pending.get(key) !== ticket) return;
        pending.delete(key);
        if (!port.isEligible(key)) return;
        qualified.add(key);
        port.emit(key);
      }, dwellMilliseconds);
    },
    pause,
    reset() {
      pause();
      qualified.clear();
    },
  };
}
