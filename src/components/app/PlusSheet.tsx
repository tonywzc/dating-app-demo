"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button, TextButton } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { CalendarIcon, PartyIcon, PeopleIcon } from "@/components/ui/icons";

export type PlusFeature = "date" | "event" | "more";

export const PLUS_PRICE = "$9.99/month";

const FEATURES: { id: PlusFeature; icon: React.ReactNode; title: string; sub: string }[] = [
  { id: "date", icon: <CalendarIcon size={22} />, title: "Plan a date", sub: "Booked and on your calendar" },
  { id: "event", icon: <PartyIcon size={22} />, title: "Host an event", sub: "We fill the room" },
  { id: "more", icon: <PeopleIcon size={22} />, title: "3 more people a week", sub: "Use them any day" },
];

const TITLE: Record<PlusFeature, string> = {
  date: "You've used your free date plan",
  event: "You've used your free event",
  more: "Want to meet more people?",
};

/** Twine Plus upsell. The demo has no payment step: subscribing just turns Plus on. */
export function PlusSheet({ feature, onSubscribe, onClose }: { feature: PlusFeature | null; onSubscribe: () => void; onClose: () => void }) {
  const [shown, setShown] = useState(feature);
  if (feature && feature !== shown) setShown(feature);

  return (
    <Sheet open={feature !== null} onClose={onClose}>
      {shown && (
        <div className="pt-2 text-center">
          <motion.div
            className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-[20px]"
            style={{ background: `linear-gradient(140deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
          >
            <BrandMark width={34} tone="white" />
          </motion.div>
          <h2 className="mt-4 text-[24px] font-bold tracking-[-0.02em]">{TITLE[shown]}</h2>
          <p className="mt-1 text-[16px] text-white/60">
            {BRAND.name} Plus &middot; {PLUS_PRICE}
          </p>
          <div className="mt-5 space-y-2 text-left">
            {FEATURES.map((f) => (
              <div
                key={f.id}
                className={`flex items-center gap-4 rounded-[20px] border px-4 py-3 ${f.id === shown ? "border-white/40 bg-white/[0.08]" : "border-white/[0.07] bg-white/[0.03]"}`}
              >
                <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[#FF8AA2]">{f.icon}</span>
                <span>
                  <span className="block text-[17px] font-semibold">{f.title}</span>
                  <span className="block text-[14px] text-white/50">{f.sub}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={onSubscribe}>Get Plus &middot; {PLUS_PRICE}</Button>
            <div className="mt-1 flex justify-center">
              <TextButton onClick={onClose} className="text-white/60">
                Not now
              </TextButton>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}
