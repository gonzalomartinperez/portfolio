"use client";

import { useSyncExternalStore } from "react";

type ExplorerState = {
  host: HTMLElement | null;
  ready: boolean;
  selected: string | null;
  resetRevision: number;
  rotation: number;
  zoom: number;
};
const initial: ExplorerState = {
  host: null,
  ready: false,
  selected: null,
  resetRevision: 0,
  rotation: 0,
  zoom: 0,
};
let state = initial;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
function update(change: Partial<ExplorerState>) {
  if (Object.entries(change).every(([key, value]) => state[key as keyof ExplorerState] === value))
    return;
  state = { ...state, ...change };
  for (const listener of listeners) listener();
}
export function useSolarExplorer() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}
export function solarExplorerSnapshot() {
  return state;
}
export function setSolarExplorerHost(host: HTMLElement | null) {
  update({ host });
}
export function setSolarReady(ready: boolean) {
  update({ ready });
}
export function selectSolarBody(selected: string | null) {
  update({ selected });
}
export function resetSolarView() {
  update({ resetRevision: state.resetRevision + 1 });
}
export function rotateSolarView(delta: number) {
  update({ rotation: state.rotation + delta });
}

export function zoomSolarView(delta: number) {
  update({ zoom: state.zoom + delta });
}
