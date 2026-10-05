"use client";

import { useSyncExternalStore } from "react";

let paused = false;
const holds = new Set<symbol>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getPageMotionPaused = () => paused || holds.size > 0;
const serverSnapshot = () => false;

/** Shared decorative-motion state survives client navigation without remounting the field. */
export function usePageMotionPaused() {
  return useSyncExternalStore(subscribe, getPageMotionPaused, serverSnapshot);
}

export function setPageMotionPaused(value: boolean) {
  if (value === paused) return;
  paused = value;
  for (const listener of listeners) listener();
}

export function holdPageMotion() {
  const hold = Symbol("decorative-motion-hold");
  holds.add(hold);
  for (const listener of listeners) listener();
  return () => {
    if (!holds.delete(hold)) return;
    for (const listener of listeners) listener();
  };
}
