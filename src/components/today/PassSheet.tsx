"use client";

import { motion } from "motion/react";
import type { Person } from "@/lib/app-data";
import { TextButton } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

const REASONS = ["Not my type", "Different goals", "Too far", "No spark", "Something else"];

/** Why pass? One tap on a reason passes. Private: they never know. */
export function PassSheet({ open, person, onPass, onClose }: { open: boolean; person: Person; onPass: (reason?: string) => void; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="pt-1 text-center text-[22px] font-bold tracking-[-0.02em]">Why not {person.name}?</h2>
      <p className="mt-1 text-center text-[15px] text-white/50">Only we see this.</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {REASONS.map((r) => (
          <motion.button
            key={r}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onPass(r)}
            className="h-[52px] rounded-full bg-white/[0.08] text-[16px] font-medium active:bg-white/15 last:col-span-2"
          >
            {r}
          </motion.button>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        <TextButton onClick={() => onPass()} className="text-white/60">
          Just pass
        </TextButton>
      </div>
    </Sheet>
  );
}
