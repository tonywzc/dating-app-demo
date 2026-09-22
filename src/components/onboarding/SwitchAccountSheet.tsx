"use client";

import { motion } from "motion/react";
import type { Account } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { Sheet } from "@/components/ui/Sheet";

export function SwitchAccountSheet({
  open,
  accounts,
  selected,
  onSelect,
  onAddAccount,
  onClose,
}: {
  open: boolean;
  accounts: Account[];
  selected: string;
  onSelect: (username: string) => void;
  onAddAccount: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between pb-3">
        <span className="w-[60px]" />
        <h2 className="text-[17px] font-semibold">Switch account</h2>
        <button type="button" onClick={onClose} className="w-[60px] text-right text-[17px] text-white/70 active:opacity-50">
          Done
        </button>
      </div>

      <div className="overflow-hidden rounded-[20px] bg-white/[0.06]">
        {accounts.map((account) => {
          const active = account.username === selected;
          return (
            <motion.button
              key={account.username}
              type="button"
              whileTap={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              onClick={() => onSelect(account.username)}
              className="flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-3 text-left"
            >
              <Avatar account={account} size={48} ring ringGap="#25242b" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[16px] font-semibold">{account.username}</div>
                <div className="mt-[2px] flex items-center gap-[5px] text-[13px] text-white/50">
                  <InstagramGlyph size={12} />
                  Instagram
                </div>
              </div>
              <Check checked={active} />
            </motion.button>
          );
        })}
        <motion.button
          type="button"
          whileTap={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          onClick={onAddAccount}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white/10">
            <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 2v14M2 9h14" />
            </svg>
          </div>
          <div className="text-[16px] font-medium">Use another Instagram account</div>
        </motion.button>
      </div>

      <p className="px-2 pb-2 pt-3 text-center text-[12px] leading-[17px] text-white/40">
        Only you can see which accounts are signed in on this iPhone.
      </p>
    </Sheet>
  );
}

function Check({ checked }: { checked: boolean }) {
  return (
    <div
      className={`flex h-[24px] w-[24px] items-center justify-center rounded-full transition-colors ${
        checked ? "bg-white" : "border-[1.5px] border-white/30"
      }`}
    >
      {checked && (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="#0b0a10" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 5.2l3 3 6-6.4" />
        </svg>
      )}
    </div>
  );
}
