"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Muse } from "@/lib/mock-data";
import { IntimateBackdrop } from "./IntimateBackdrop";
import { MuseAvatar } from "./MuseAvatar";

const STEPS = ["Listening back to what you shared", "Finding what matters most to you", "Seeing who's out there for you"];
const STEP_MS = 850;

/** Muse gathers the conversation: the user's own words drift into her before the summary. */
export function MuseProcessing({ muse, snippets, onDone }: { muse: Muse; snippets: string[]; onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)));
    timers.push(setTimeout(onDone, STEP_MS * STEPS.length + 700));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
      <IntimateBackdrop mode="speaking" />
      <div className="pt-safe relative flex h-full flex-col items-center">
        <div className="relative mt-[150px] flex h-[180px] w-[180px] items-center justify-center">
          <MuseAvatar muse={muse} size={150} mood="thinking" />
          {snippets.slice(-4).map((text, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute w-[260px] text-center text-[14px] leading-[19px] text-white/80"
              initial={{ opacity: 0, y: 360 + i * 30, scale: 1 }}
              animate={{ opacity: [0, 0.9, 0], y: [360 + i * 30, 160, 0], scale: [1, 0.8, 0.2] }}
              transition={{ duration: 1.8, delay: 0.1 + i * 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              &ldquo;{text.length > 60 ? `${text.slice(0, 58).trim()}…` : text}&rdquo;
            </motion.div>
          ))}
        </div>

        <h2 className="mt-12 text-[24px] font-bold tracking-[-0.02em]">Putting you into words&hellip;</h2>
        <ul className="mt-5 space-y-3">
          {STEPS.map((label, i) => (
            <motion.li
              key={label}
              className="flex items-center gap-3 text-[15px]"
              animate={{ opacity: i < step ? 1 : i === step ? 0.7 : 0.3 }}
              transition={{ duration: 0.3 }}
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white/40">
                {i < step && (
                  <motion.svg width="10" height="8" viewBox="0 0 12 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <path d="M1.5 5.2l3 3 6-6.4" />
                  </motion.svg>
                )}
              </span>
              {label}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
