"use client";

import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Account } from "@/lib/mock-data";
import { BrandMark } from "@/components/brand/BrandMark";
import { Avatar } from "@/components/ui/Avatar";
import { Button, TextButton } from "@/components/ui/Button";
import { FromMeta } from "@/components/ui/FromMeta";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.2, 0.8, 0.2, 1] as const },
});

export function AccountPicker({
  account,
  continuing,
  onContinue,
  onSwitch,
  onLegal,
}: {
  account: Account;
  continuing: boolean;
  onContinue: () => void;
  onSwitch: () => void;
  onLegal: (doc: "terms" | "privacy") => void;
}) {
  return (
    <motion.div
      className="pt-safe pb-safe absolute inset-0 flex flex-col bg-ink"
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <Aurora />

      <div className="relative flex flex-1 flex-col items-center justify-center pb-6">
        <motion.div layoutId="brand-mark" transition={{ type: "spring", stiffness: 170, damping: 24 }}>
          <BrandMark width={92} />
        </motion.div>
        <motion.h1
          layoutId="brand-name"
          className="mt-5 text-[36px] font-bold tracking-[-0.03em]"
          transition={{ type: "spring", stiffness: 170, damping: 24 }}
        >
          {BRAND.name}
        </motion.h1>
        <motion.p className="mt-1 text-[16px] text-white/60" {...rise(0.25)}>
          {BRAND.tagline}
        </motion.p>
      </div>

      <div className="relative px-5">
        <motion.p className="mb-3 px-1 text-[13px] font-medium uppercase tracking-[0.06em] text-white/45" {...rise(0.35)}>
          Choose an account to start with
        </motion.p>

        <motion.button
          type="button"
          onClick={onSwitch}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center gap-[14px] rounded-[22px] border border-white/10 bg-white/[0.06] p-[14px] text-left backdrop-blur-xl"
          {...rise(0.42)}
        >
          <Avatar account={account} size={56} ring ringGap="#1a1920" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-semibold">{account.username}</div>
            <div className="mt-[3px] flex items-center gap-[6px] text-[14px] text-white/55">
              <InstagramGlyph size={14} />
              Instagram
            </div>
          </div>
          <div className="flex items-center gap-1 pr-1 text-[14px] font-medium text-white/50">
            Switch
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 1.5l5 5-5 5" />
            </svg>
          </div>
        </motion.button>

        <motion.div className="mt-4" {...rise(0.5)}>
          <Button onClick={onContinue} loading={continuing}>
            Continue as {account.username}
          </Button>
        </motion.div>

        <motion.div className="mt-1 flex justify-center" {...rise(0.55)}>
          <TextButton onClick={onSwitch} className="text-white/80">
            Use another account
          </TextButton>
        </motion.div>

        <motion.p className="mx-auto mt-2 max-w-[300px] text-center text-[12px] leading-[17px] text-white/40" {...rise(0.6)}>
          By continuing, you agree to {BRAND.name}&apos;s{" "}
          <button type="button" className="font-semibold text-white/70 underline-offset-2 active:underline" onClick={() => onLegal("terms")}>
            Terms
          </button>{" "}
          and{" "}
          <button type="button" className="font-semibold text-white/70 underline-offset-2 active:underline" onClick={() => onLegal("privacy")}>
            Privacy Policy
          </button>
          .
        </motion.p>

        <motion.div className="mt-6 mb-1 flex justify-center" {...rise(0.65)}>
          <FromMeta />
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Soft brand-colored light behind the content. */
export function Aurora() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="absolute -left-[120px] -top-[80px] h-[420px] w-[420px] rounded-full blur-[70px]"
        style={{ background: BRAND.colors.rose, opacity: 0.28 }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[140px] top-[120px] h-[420px] w-[420px] rounded-full blur-[80px]"
        style={{ background: BRAND.colors.violet, opacity: 0.3 }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink via-ink/90 to-transparent" />
    </motion.div>
  );
}
