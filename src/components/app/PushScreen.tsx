"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronLeft } from "@/components/ui/icons";

/** A screen pushed on top of the tabs, sliding in from the right like a UINavigationController push. */
export function PushScreen({ children, background = "#0B0A10", z = 35 }: { children: ReactNode; background?: string; z?: number }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ background, zIndex: z, boxShadow: "-20px 0 40px rgba(0,0,0,0.45)" }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 40 }}
    >
      {children}
    </motion.div>
  );
}

/** Round glass back button. */
export function BackButton({ onPress, label = "Back" }: { onPress: () => void; label?: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onPress}
      whileTap={{ scale: 0.92 }}
      className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.1] backdrop-blur-xl"
    >
      <ChevronLeft size={20} />
    </motion.button>
  );
}
