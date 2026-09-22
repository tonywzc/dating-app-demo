"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Account } from "@/lib/mock-data";
import { AppIcon } from "@/components/brand/AppIcon";
import { Button, TextButton } from "@/components/ui/Button";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { Sheet } from "@/components/ui/Sheet";

/** Consent step: what the dating app gets from the Instagram account. */
export function ConnectSheet({
  open,
  account,
  confirming,
  onConfirm,
  onClose,
}: {
  open: boolean;
  account: Account;
  confirming: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center justify-center gap-3 pt-3">
        <AppIcon size={62} />
        <ConnectorDots />
        <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[14px] bg-white">
          <InstagramGlyph size={36} />
        </div>
      </div>

      <h2 className="mt-5 text-center text-[24px] font-bold tracking-[-0.02em]">Start with Instagram</h2>
      <p className="mx-auto mt-1 max-w-[300px] text-center text-[15px] leading-[21px] text-white/60">
        {BRAND.name} will set up your profile using <span className="font-semibold text-white/85">{account.username}</span>.
      </p>

      <div className="mt-5 space-y-4 rounded-[22px] bg-white/[0.06] p-4">
        <Row icon={<PersonIcon />} title="Name, username and profile photo">
          Used to create your profile. You can edit it anytime.
        </Row>
        <Row icon={<PhotosIcon />} title="Only the photos you pick">
          Nothing is imported until you choose it.
        </Row>
        <Row icon={<LockIcon />} title="Your dating life stays private">
          {BRAND.name} never posts to Instagram, and your followers aren&apos;t told you&apos;re here.
        </Row>
      </div>

      <div className="mt-5">
        <Button onClick={onConfirm} loading={confirming}>
          Continue
        </Button>
        <div className="mt-1 flex justify-center">
          <TextButton onClick={onClose} className="text-white/70">
            Not now
          </TextButton>
        </div>
      </div>
    </Sheet>
  );
}

function Row({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
        {icon}
      </div>
      <div>
        <div className="text-[15px] font-semibold leading-[20px]">{title}</div>
        <div className="mt-[2px] text-[13px] leading-[18px] text-white/55">{children}</div>
      </div>
    </div>
  );
}

function ConnectorDots() {
  return (
    <div className="flex gap-[6px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-[6px] w-[6px] rounded-full bg-white"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function PersonIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function PhotosIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="9" cy="9" r="1.8" />
      <path d="M21 15l-5-5L5 21" />
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
