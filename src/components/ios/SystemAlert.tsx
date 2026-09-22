"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

export type AlertButton = {
  label: string;
  onPress: () => void;
  /** "preferred" is the tinted default action. */
  style?: "default" | "preferred";
};

export type AlertSpec = {
  title: string;
  message: string;
  buttons: AlertButton[];
  /** Stack buttons vertically (iOS does this for 3+ actions). */
  stacked?: boolean;
  /** Extra content between the message and the buttons, e.g. a photo preview. */
  accessory?: ReactNode;
};

/** iOS 26 system alert (dark appearance), used for the permission prompts. */
export function SystemAlert({ alert }: { alert: AlertSpec | null }) {
  return (
    <AnimatePresence>
      {alert && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            key={alert.title}
            role="alertdialog"
            aria-label={alert.title}
            className="relative w-[300px] rounded-[34px] border border-white/10 bg-[#2A2A2E]/85 px-5 pb-5 pt-6 text-center text-white shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          >
            <h2 className="text-[17px] font-semibold leading-[22px]">{alert.title}</h2>
            <p className="mt-[6px] text-[14px] leading-[19px] text-white/75">{alert.message}</p>
            {alert.accessory && <div className="mt-4">{alert.accessory}</div>}
            <div className={`mt-5 gap-2 ${alert.stacked ? "flex flex-col" : "flex"}`}>
              {alert.buttons.map((b) => (
                <motion.button
                  key={b.label}
                  type="button"
                  onClick={b.onPress}
                  whileTap={{ scale: 0.96 }}
                  className={`h-[46px] flex-1 rounded-full text-[17px] ${
                    b.style === "preferred" ? "bg-[#0A84FF] font-semibold text-white" : "bg-white/[0.12] font-medium text-white"
                  }`}
                >
                  {b.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
