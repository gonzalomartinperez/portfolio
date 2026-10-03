"use client";

import { useSyncExternalStore } from "react";

let paused = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => paused;
const serverSnapshot = () => false;

/** Shared decorative-motion state survives client navigation without remounting the field. */
export function usePageMotionPaused() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function setPageMotionPaused(value: boolean) {
  if (value === paused) return;
  paused = value;
  for (const listener of listeners) listener();
}
