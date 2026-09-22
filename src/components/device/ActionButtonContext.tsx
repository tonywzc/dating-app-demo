"use client";

import { createContext, useContext } from "react";

/** Lets screens use the simulated iPhone Action Button on the device frame. */
export type ActionButtonState = {
  /** Pulse the frame's Action Button to draw the eye to it. */
  setHint: (on: boolean) => void;
  /** Called with `true` on press and `false` on release. Returns an unsubscribe. */
  subscribe: (listener: (pressed: boolean) => void) => () => void;
};

export const ActionButtonContext = createContext<ActionButtonState>({ setHint: () => {}, subscribe: () => () => {} });

export const useActionButton = () => useContext(ActionButtonContext);
