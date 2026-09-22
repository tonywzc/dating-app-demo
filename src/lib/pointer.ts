import type { PointerEvent } from "react";

/** Keep receiving pointer events after the finger/cursor leaves the element (hold-to-talk). */
export function capturePointer(e: PointerEvent<Element>) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // Synthetic events (automation, tests) have no active pointer to capture.
  }
}
