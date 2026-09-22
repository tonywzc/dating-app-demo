"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Account } from "@/lib/mock-data";
import { BrandMark } from "@/components/brand/BrandMark";
import { Aurora } from "./AccountPicker";

const STEP_MS = 850;

export function SettingUp({ account, onDone }: { account: Account; onDone: () => void }) {
  const steps = [
    `Connecting ${account.username}`,
    "Bringing over your profile basics",
    "Getting your first introductions ready",
  ];
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setDone(i + 1), STEP_MS * (i + 1)));
    timers.push(setTimeout(onDone, STEP_MS * steps.length + 650));
    return () => timers.forEach(clearTimeout);
    // Steps are fixed for the life of this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone]);

  return (
    <motion.div
      className="pt-safe pb-safe absolute inset-0 flex flex-col items-center justify-center bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      <Aurora />

      <div className="relative flex h-[180px] w-[180px] items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${BRAND.colors.rose} 90deg, ${BRAND.colors.violet} 180deg, transparent 260deg)`,
            mask: "radial-gradient(closest-side, transparent 92%, #000 93%)",
            WebkitMask: "radial-gradient(closest-side, transparent 92%, #000 93%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div layoutId="brand-mark" transition={{ type: "spring", stiffness: 170, damping: 24 }}>
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
            <BrandMark width={84} />
          </motion.div>
        </motion.div>
      </div>

      <h2 className="relative mt-10 text-[24px] font-bold tracking-[-0.02em]">Setting things up</h2>

      <ul className="relative mt-6 w-[290px] space-y-4">
        {steps.map((label, i) => {
          const state = i < done ? "done" : i === done ? "active" : "pending";
          return (
            <motion.li
              key={label}
              className="flex items-center gap-3 text-[15px]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: state === "pending" ? 0.35 : 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <StepDot state={state} />
              <span className={state === "done" ? "text-white" : "text-white/70"}>{label}</span>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

function StepDot({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <motion.span
        className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
        style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <svg width="11" height="9" viewBox="0 0 12 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 5.2l3 3 6-6.4" />
        </svg>
      </motion.span>
    );
  }
  return (
    <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] border-white/25">
      {state === "active" && (
        <motion.span
          className="h-[8px] w-[8px] rounded-full bg-white"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </span>
  );
}
