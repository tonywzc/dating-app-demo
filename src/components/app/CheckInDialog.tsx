"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TimelineEntry } from "@/lib/app-data";
import { HeartIcon } from "@/components/photos/StoryScan";
import { Photo } from "@/components/ui/Photo";

/**
 * Asked when you come back to the app after a date or event: did you go, and how was it
 * (0–5 hearts)? Answers fill your timeline and tell us which introductions work.
 */
export function CheckInDialog({ entry, onAnswer }: { entry: TimelineEntry | null; onAnswer: (went: boolean, rating?: number) => void }) {
  return (
    <AnimatePresence>
      {entry && (
        <div className="absolute inset-0 z-[62] flex items-center justify-center px-8">
          <motion.div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <Card key={entry.id} entry={entry} onAnswer={onAnswer} />
        </div>
      )}
    </AnimatePresence>
  );
}

function Card({ entry, onAnswer }: { entry: TimelineEntry; onAnswer: (went: boolean, rating?: number) => void }) {
  const [step, setStep] = useState<"went" | "rate">("went");
  const [rating, setRating] = useState(0);

  return (
    <motion.div
      role="alertdialog"
      aria-label={entry.title}
      className="relative w-full overflow-hidden rounded-[30px] border border-white/10 bg-[#211F28]/95 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
    >
      <Photo src={entry.photo} className="h-[120px] w-full" />
      <div className="relative -mt-[30px] flex justify-center">
        <div className="flex -space-x-3">
          {entry.with.map((f) => (
            <Photo key={f} src={f} className="h-[56px] w-[56px] rounded-full ring-4 ring-[#211F28]" />
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 pt-3">
        <div className="text-[14px] text-white/50">
          {entry.title} &middot; {entry.when}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {step === "went" ? (
            <motion.div key="went" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="mt-1 text-[22px] font-bold">Did you go?</h2>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => onAnswer(false)} className="h-[50px] rounded-full bg-white/10 text-[17px] font-semibold active:bg-white/20">
                  No
                </button>
                <button type="button" onClick={() => setStep("rate")} className="h-[50px] rounded-full bg-white text-[17px] font-semibold text-black">
                  Yes
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="rate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="mt-1 text-[22px] font-bold">How was it?</h2>
              <div className="mt-4 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.button
                    key={n}
                    type="button"
                    aria-label={`${n} hearts`}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setRating(n === rating ? 0 : n)}
                    className="flex h-[48px] w-[48px] items-center justify-center"
                  >
                    <motion.span animate={{ scale: n <= rating ? 1.1 : 1 }}>
                      <HeartIcon size={32} color={n <= rating ? "#FF3F6E" : "rgba(255,255,255,0.2)"} />
                    </motion.span>
                  </motion.button>
                ))}
              </div>
              <button type="button" onClick={() => onAnswer(true, rating)} className="mt-4 h-[50px] w-full rounded-full bg-white text-[17px] font-semibold text-black">
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
