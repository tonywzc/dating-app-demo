"use client";

import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";
import { Aurora } from "./AccountPicker";

/** End of the demo. What happens after onboarding hasn't been decided yet, so we just say thanks. */
export function DemoEnd({ onReplay }: { onReplay: () => void }) {
  return (
    <motion.div
      className="pt-safe pb-safe absolute inset-0 flex flex-col items-center justify-center bg-ink px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <Aurora />
      <motion.div
        className="relative"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
      >
        <BrandMark width={72} />
      </motion.div>
      <motion.h1
        className="relative mt-8 text-[30px] font-bold leading-[36px] tracking-[-0.03em]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Thanks for taking a look
      </motion.h1>
      <motion.p
        className="relative mt-2 max-w-[300px] text-[16px] leading-[23px] text-white/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.5 }}
      >
        That&apos;s the {BRAND.name} onboarding. We&apos;re glad you walked through it.
      </motion.p>
      <motion.div
        className="relative mt-6 flex max-w-[300px] items-start gap-[10px] rounded-[16px] border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-[13px] leading-[18px] text-white/65"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.span
          className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-[#FF8AA2]"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        This demo is a work in progress. More of the product experience is coming soon.
      </motion.div>
      <motion.div
        className="relative mt-9 w-full max-w-[280px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        <Button onClick={onReplay}>Replay onboarding</Button>
      </motion.div>
    </motion.div>
  );
}
