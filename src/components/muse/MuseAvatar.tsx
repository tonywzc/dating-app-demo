"use client";

import { useEffect } from "react";
import { motion, useAnimate } from "motion/react";
import type { Muse } from "@/lib/mock-data";

export type MuseMood = "idle" | "speaking" | "listening" | "thinking";

/**
 * The agent's face. Uses the user's own Muse avatar if they've set one up,
 * otherwise the default Muse: a warm, living orb.
 */
export function MuseAvatar({ muse, size, mood, pulse = 0 }: { muse?: Muse; size: number; mood: MuseMood; pulse?: number }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  // A small swell on every spoken word.
  useEffect(() => {
    if (mood !== "speaking" || !scope.current) return;
    animate(scope.current, { scale: [1, 1.045, 1] }, { duration: 0.28, ease: "easeOut" });
  }, [pulse, mood, animate, scope]);

  const listening = mood === "listening";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Aura */}
      <motion.div
        className="absolute rounded-full blur-2xl"
        style={{
          inset: -size * 0.35,
          background: "radial-gradient(closest-side, rgba(255,140,150,0.55), rgba(140,90,255,0.25) 60%, transparent)",
        }}
        animate={{ opacity: mood === "idle" ? 0.55 : 0.9, scale: listening ? [1, 1.08, 1] : [1, 1.03, 1] }}
        transition={{ opacity: { duration: 0.6 }, scale: { duration: listening ? 2.2 : 4, repeat: Infinity, ease: "easeInOut" } }}
      />

      {/* Listening: soft rings drawn inward, like she's leaning in */}
      {listening &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-white/25"
            initial={{ scale: 1.7, opacity: 0 }}
            animate={{ scale: [1.7, 1.05], opacity: [0, 0.6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
          />
        ))}

      <div ref={scope} className="absolute inset-0">
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-full"
          animate={{ scale: listening ? 0.94 : mood === "thinking" ? [1, 0.97, 1] : [1, 1.02, 1] }}
          transition={
            listening
              ? { type: "spring", stiffness: 120, damping: 14 }
              : { duration: mood === "thinking" ? 1.2 : 4.5, repeat: Infinity, ease: "easeInOut" }
          }
          style={{ boxShadow: "inset 0 0 30px rgba(255,255,255,0.25), 0 20px 60px -10px rgba(255,79,123,0.5)" }}
        >
          {muse?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={muse.avatarUrl} alt={muse.name} className="h-full w-full object-cover" />
          ) : (
            <DefaultMuse mood={mood} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function DefaultMuse({ mood }: { mood: MuseMood }) {
  const spin = mood === "thinking" ? 3 : mood === "listening" ? 9 : 16;
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 34% 30%, #FFF1E6 0%, #FFB199 20%, #FF5F86 46%, #B04DE0 72%, #5B3BFF 100%)" }}
      />
      {/* Slow inner current */}
      <motion.div
        className="absolute inset-[-20%] mix-blend-soft-light"
        style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.85) 60deg, transparent 140deg, rgba(255,210,180,0.6) 230deg, transparent 320deg)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: spin, repeat: Infinity, ease: "linear" }}
      />
      {/* Drifting highlight */}
      <motion.div
        className="absolute h-[45%] w-[45%] rounded-full bg-white/50 blur-xl"
        animate={{ left: ["14%", "34%", "18%"], top: ["12%", "22%", "30%"] }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      {/* Glassy rim */}
      <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 -12px 24px rgba(40,10,90,0.35), inset 0 6px 14px rgba(255,255,255,0.35)" }} />
    </>
  );
}
