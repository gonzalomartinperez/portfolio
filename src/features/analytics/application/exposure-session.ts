import { type ExposureIntent, interactionIntent } from "../domain/interactions.ts";
import { createExposureDwell } from "./exposure-dwell.ts";

type Observation = { intent: ExposureIntent; eligible(): boolean };
type Ports = {
  schedule(callback: () => void, delay: number): number;
  cancel(timer: number): void;
  record(intent: ExposureIntent): void;
};

/** Own the route-visit lifecycle independently of React effect cleanup/restart. */
export function createExposureSession(ports: Ports) {
  let pathname: string | null = null;
  const observations = new Map<string, Observation>();
  const dwell = createExposureDwell({
    schedule: ports.schedule,
    cancel: ports.cancel,
    isEligible: (key) => observations.get(key)?.eligible() ?? false,
    emit(key) {
      const observation = observations.get(key);
      if (observation) ports.record(observation.intent);
    },
  });

  function pause() {
    dwell.pause();
    observations.clear();
  }

  return {
    commit(next: string | null) {
      if (next === pathname) return;
      pathname = next;
      pause();
      dwell.reset();
    },
    register(intent: ExposureIntent, eligible: () => boolean): string | null {
      const reviewed = interactionIntent(intent);
      if (reviewed?.event_name !== "section_exposure" || observations.size >= 96) return null;
      const key = `${reviewed.region_id}:${reviewed.layout_revision}:${reviewed.viewport}`;
      observations.set(key, { intent: reviewed, eligible });
      return key;
    },
    observe(key: string, eligible: boolean) {
      dwell.observe(key, eligible && observations.has(key));
    },
    pause,
  };
}
