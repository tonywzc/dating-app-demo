"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Account } from "@/lib/mock-data";
import { BrandMark } from "@/components/brand/BrandMark";
import { Avatar } from "@/components/ui/Avatar";
import { Button, TextButton } from "@/components/ui/Button";
import { Aurora } from "./AccountPicker";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.2, 0.8, 0.2, 1] as const },
});

/** End of the onboarding demo. */
export function Welcome({
  account,
  name,
  onReplay,
  onSignOut,
}: {
  account: Account;
  name: string;
  onReplay: () => void;
  onSignOut: () => void;
}) {
  return (
    <motion.div
      className="pt-safe pb-safe absolute inset-0 flex flex-col bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <Aurora />

      <div className="relative flex flex-1 flex-col items-center px-6 pt-16">
        <motion.div
          className="relative"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        >
          <div
            className="flex h-[124px] w-[124px] items-center justify-center rounded-full"
            style={{ background: `conic-gradient(from 200deg, ${BRAND.colors.rose}, ${BRAND.colors.overlap}, ${BRAND.colors.violet}, ${BRAND.colors.rose})` }}
          >
            <div className="flex h-[118px] w-[118px] items-center justify-center rounded-full bg-ink">
              <Avatar account={account} size={108} />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-[40px] w-[40px] items-center justify-center rounded-full border-[3px] border-ink bg-[#1C1B22]">
            <BrandMark width={22} />
          </div>
        </motion.div>

        <motion.h1 className="mt-7 text-center text-[32px] font-bold tracking-[-0.03em]" {...rise(0.25)}>
          Nice to meet you, {name}.
        </motion.h1>
        <motion.p className="mt-2 max-w-[310px] text-center text-[16px] leading-[22px] text-white/60" {...rise(0.33)}>
          {BRAND.name} is built for real connection, not endless swiping.
        </motion.p>

        <motion.div className="mt-8 w-full space-y-3" {...rise(0.42)}>
          <Pillar icon={<SparkIcon />} title="A few great introductions a day">
            Picked for you, with a reason you&apos;ll actually care about.
          </Pillar>
          <Pillar icon={<MomentsIcon />} title="Profiles made of real moments">
            Show the life you live, not just your best angle.
          </Pillar>
          <Pillar icon={<LockIcon />} title="Private from your followers">
            Nobody on Instagram sees that you&apos;re here.
          </Pillar>
        </motion.div>
      </div>

      <motion.div className="relative px-5 pb-2" {...rise(0.55)}>
        <Button onClick={onReplay}>Replay onboarding</Button>
        <div className="mt-1 flex justify-center">
          <TextButton onClick={onSignOut} className="text-white/70">
            Sign out
          </TextButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Pillar({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.05] p-4">
      <div
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[15px] font-semibold leading-[20px]">{title}</div>
        <div className="mt-[2px] text-[13px] leading-[18px] text-white/55">{children}</div>
      </div>
    </div>
  );
}

const iconProps = {
  width: 17,
  height: 17,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SparkIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
    </svg>
  );
}

function MomentsIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="6" width="13" height="15" rx="3" />
      <path d="M8 3h9a4 4 0 014 4v10" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="11" width="16" height="10" rx="3" />
      <path d="M8 11V7.5a4 4 0 018 0V11" />
    </svg>
  );
}
