"use client";

import { motion } from "motion/react";

export type BackdropMode = "calm" | "speaking" | "listening" | "voice";

// Deterministic motes: [left %, size px, duration s, delay s]
const MOTES = Array.from({ length: 16 }, (_, i) => [
  (i * 61) % 100,
  2 + ((i * 7) % 3),
  11 + ((i * 13) % 9),
  -((i * 17) % 14),
]);

/**
 * Warm, candle-lit background for the conversation. Loops never restart on mode
 * change; the mode only fades layers in and out, so transitions stay smooth.
 */
export function IntimateBackdrop({ mode }: { mode: BackdropMode }) {
  const warmth = { calm: 0.45, speaking: 0.65, listening: 0.8, voice: 1 }[mode];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0A0810]">
      {/* Drifting color fields */}
      <motion.div
        className="absolute -left-[30%] top-[8%] h-[520px] w-[520px] rounded-full blur-[90px]"
        style={{ background: "#FF4F7B" }}
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 90, 0], opacity: 0.22 + warmth * 0.12 }}
        transition={{ x: { duration: 22, repeat: Infinity, ease: "easeInOut" }, y: { duration: 22, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 1.2 } }}
      />
      <motion.div
        className="absolute -right-[35%] top-[28%] h-[560px] w-[560px] rounded-full blur-[100px]"
        style={{ background: "#6A4BFF" }}
        animate={{ x: [0, -50, 10, 0], y: [0, -30, 50, 0], opacity: 0.2 + warmth * 0.1 }}
        transition={{ x: { duration: 26, repeat: Infinity, ease: "easeInOut" }, y: { duration: 26, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 1.2 } }}
      />

      {/* Candle glow rising from where the mic sits */}
      <motion.div
        className="absolute bottom-[-260px] left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full blur-[70px]"
        style={{ background: "radial-gradient(closest-side, #FFB38A, #FF6A88 45%, transparent)" }}
        animate={{ opacity: warmth * 0.75, scale: [1, 1.06, 0.98, 1] }}
        transition={{ opacity: { duration: 1 }, scale: { duration: 5.5, repeat: Infinity, ease: "easeInOut" } }}
      />
      {/* Faster flicker that only shows while the user is talking */}
      <motion.div
        className="absolute bottom-[-180px] left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full blur-[50px]"
        style={{ background: "radial-gradient(closest-side, #FFD2B8, transparent)" }}
        animate={{ opacity: mode === "voice" ? [0.25, 0.5, 0.3, 0.55, 0.25] : 0, scale: [1, 1.08, 1.02, 1.1, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Motes of light */}
      <motion.div className="absolute inset-0" animate={{ opacity: 0.35 + warmth * 0.5 }} transition={{ duration: 1 }}>
        {MOTES.map(([left, size, duration, delay], i) => (
          <span
            key={i}
            className="mote absolute bottom-[-10px] rounded-full bg-[#FFE3D2]"
            style={{ left: `${left}%`, width: size, height: size, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
          />
        ))}
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55))" }} />
    </div>
  );
}
