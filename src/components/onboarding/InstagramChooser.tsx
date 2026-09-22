"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { OTHER_ACCOUNTS, type Account } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { FromMeta } from "@/components/ui/FromMeta";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Mock "use another Instagram account" screen, pushed on top of the account picker.
 * Deliberately has no sign-in fields: the demo is shared publicly, and nothing here
 * should look like a credential form.
 */
export function InstagramChooser({ onBack, onChoose }: { onBack: () => void; onChoose: (account: Account) => void }) {
  const [choosing, setChoosing] = useState<string | null>(null);

  const choose = (account: Account) => {
    if (choosing) return;
    setChoosing(account.username);
    setTimeout(() => onChoose(account), 900);
  };

  return (
    <motion.div
      className="pt-safe pb-safe absolute inset-0 z-30 flex flex-col bg-white text-black"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 40 }}
      style={{ boxShadow: "-20px 0 40px rgba(0,0,0,0.25)" }}
    >
      <div className="flex h-[44px] items-center px-2">
        <button type="button" onClick={onBack} aria-label="Back" className="flex h-[44px] w-[44px] items-center justify-center active:opacity-40">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2L2 10l8 8" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6">
        <div className="mt-14 flex flex-col items-center">
          <InstagramGlyph size={64} />
          <h1 className="mt-6 text-[22px] font-bold tracking-[-0.01em]">Choose an account</h1>
          <p className="mt-1 text-center text-[15px] text-black/55">to continue to {BRAND.name}</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[18px] border border-black/10">
          {OTHER_ACCOUNTS.map((account) => (
            <motion.button
              key={account.username}
              type="button"
              onClick={() => choose(account)}
              whileTap={{ backgroundColor: "rgba(0,0,0,0.04)" }}
              className="flex w-full items-center gap-3 border-b border-black/[0.07] px-4 py-3 text-left last:border-b-0"
            >
              <Avatar account={account} size={48} ring ringGap="#fff" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[16px] font-semibold">{account.username}</div>
                <div className="text-[13px] text-black/50">Instagram</div>
              </div>
              {choosing === account.username ? (
                <Spinner color="#000" />
              ) : (
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/30">
                  <path d="M1.5 1.5l5 5-5 5" />
                </svg>
              )}
            </motion.button>
          ))}
        </div>

        <p className="mt-4 text-center text-[12px] leading-[17px] text-black/45">Demo accounts. No sign-in needed.</p>

        <div className="mt-auto flex justify-center pb-2">
          <FromMeta tone="dark" />
        </div>
      </div>
    </motion.div>
  );
}
