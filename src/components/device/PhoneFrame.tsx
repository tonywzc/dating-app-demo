"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { capturePointer } from "@/lib/pointer";
import { ActionButtonContext } from "./ActionButtonContext";
import { StatusBar, type StatusTone } from "./StatusBar";

const DEVICE_W = 402 + 24;
const DEVICE_H = 874 + 24;
const STAGE_MARGIN = 40;

/** iPhone 17 Pro frame, scaled down to fit the window on desktop. */
export function PhoneFrame({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [actionPressed, setActionPressed] = useState(false);
  const [actionHint, setActionHint] = useState(false);
  const listeners = useRef(new Set<(pressed: boolean) => void>());
  const pressAction = (pressed: boolean) => {
    setActionPressed(pressed);
    listeners.current.forEach((l) => l(pressed));
  };
  const subscribe = useCallback((listener: (pressed: boolean) => void) => {
    listeners.current.add(listener);
    return () => void listeners.current.delete(listener);
  }, []);
  const actionButton = useMemo(() => ({ setHint: setActionHint, subscribe }), [subscribe]);

  useEffect(() => {
    const fit = () => {
      const scale = Math.min(
        1,
        (window.innerHeight - STAGE_MARGIN * 2) / DEVICE_H,
        (window.innerWidth - STAGE_MARGIN * 2) / DEVICE_W,
      );
      ref.current?.style.setProperty("--device-scale", String(scale));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className="stage">
      <div ref={ref} className="device">
        {/* Action button (pressable), volume, side button, Camera Control */}
        <button
          type="button"
          aria-label="Action Button"
          className={`device-button action-button ${actionHint ? "action-button-hint" : ""} ${actionPressed ? "action-button-pressed" : ""}`}
          style={{ left: -5, top: 190, height: 34 }}
          onPointerDown={(e) => {
            capturePointer(e);
            pressAction(true);
          }}
          onPointerUp={() => actionPressed && pressAction(false)}
          onPointerCancel={() => actionPressed && pressAction(false)}
        />
        <span className="device-button" style={{ left: -5, top: 250, height: 64 }} />
        <span className="device-button" style={{ left: -5, top: 330, height: 64 }} />
        <span className="device-button" style={{ right: -5, top: 270, height: 104 }} />
        <span className="device-button" style={{ right: -5, top: 560, height: 58 }} />

        <div className="screen">
          <ActionButtonContext.Provider value={actionButton}>{children}</ActionButtonContext.Provider>
          <StatusBar tone={tone} />
          <div className="dynamic-island" />
          <div
            className="sim-chrome pointer-events-none absolute bottom-[8px] left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full transition-colors duration-300"
            style={{ background: tone === "light" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)" }}
          />
        </div>
      </div>
    </div>
  );
}
