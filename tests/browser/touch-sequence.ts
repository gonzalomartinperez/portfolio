import type { Locator } from "@playwright/test";

type TouchStep = {
  type: "pointerdown" | "pointermove" | "pointerup";
  pointerId?: number;
  isPrimary?: boolean;
  clientX?: number;
  clientY?: number;
};

// Protocol round trips must not turn a short synthetic tap into a long press.
export async function dispatchTouchSequence(target: Locator, steps: TouchStep[]) {
  await target.evaluate((element, events) => {
    for (const { type, ...init } of events) {
      element.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerType: "touch",
          isPrimary: true,
          pointerId: 1,
          clientX: 180,
          clientY: 550,
          ...init,
        }),
      );
    }
  }, steps);
}
