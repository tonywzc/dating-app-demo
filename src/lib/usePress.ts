"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

const LONG_PRESS_MS = 420;
const MOVE_SLOP = 8;

/** Tap, or press and hold, without fighting a surrounding drag (map pan, page swipe). */
export function usePress(onTap: () => void, onHold?: () => void) {
  const state = useRef<{ x: number; y: number; timer?: ReturnType<typeof setTimeout>; held: boolean; moved: boolean } | null>(null);
  const clear = () => {
    if (state.current?.timer) clearTimeout(state.current.timer);
  };
  return {
    onPointerDown: (e: ReactPointerEvent) => {
      clear();
      state.current = { x: e.clientX, y: e.clientY, held: false, moved: false };
      if (onHold)
        state.current.timer = setTimeout(() => {
          if (state.current && !state.current.moved) {
            state.current.held = true;
            onHold();
          }
        }, LONG_PRESS_MS);
    },
    onPointerMove: (e: ReactPointerEvent) => {
      const s = state.current;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > MOVE_SLOP) {
        s.moved = true;
        clear();
      }
    },
    onPointerUp: () => {
      const s = state.current;
      clear();
      if (s && !s.moved && !s.held) onTap();
      state.current = null;
    },
    onPointerCancel: () => {
      clear();
      state.current = null;
    },
    onPointerLeave: () => {
      if (state.current) state.current.moved = true;
      clear();
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}

