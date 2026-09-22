"use client";

import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { NEARBY_AREA, type Summary } from "@/lib/muse-script";
import type { Account, Muse } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { Button, TextButton } from "@/components/ui/Button";
import { TopFade } from "@/components/ui/TopFade";
import { CityMap } from "./CityMap";
import { MuseAvatar } from "./MuseAvatar";

export type ProfileBasics = { firstName: string; age?: number; location: string };

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] as const },
});

/** Muse's read on the user, and how big their circle of great fits is. */
export function MuseResult({
  muse,
  account,
  profile,
  summary,
  onContinue,
  onTellMore,
}: {
  muse: Muse;
  account: Account;
  profile: ProfileBasics;
  summary: Summary;
  onContinue: () => void;
  onTellMore: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 bg-[#0A0810]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: "radial-gradient(80% 70% at 50% 0%, rgba(255,95,134,0.28), rgba(106,75,255,0.12) 55%, transparent)" }}
      />

      <TopFade color="#0A0810" />
      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto px-4 pb-[170px]">
        {/* Muse's note */}
        <motion.div className="flex items-start gap-3 px-2 pt-6" {...rise(0.05)}>
          <MuseAvatar muse={muse} size={44} mood="idle" />
          <p className="pt-[2px] text-[19px] font-medium leading-[26px] tracking-[-0.01em]">
            Thank you for trusting me with all that, {profile.firstName}. Here&apos;s who I heard.
          </p>
        </motion.div>

        {/* Who you are */}
        <motion.div
          className="mt-6 rounded-[30px] p-[1px]"
          style={{ background: `linear-gradient(160deg, ${BRAND.colors.roseTop}88, rgba(255,255,255,0.08) 40%, ${BRAND.colors.violet}88)` }}
          {...rise(0.2)}
        >
          <div className="rounded-[29px] bg-[#15131C] p-5">
            <div className="flex items-center gap-3">
              <Avatar account={account} size={54} ring ringGap="#15131C" />
              <div className="min-w-0 flex-1">
                <div className="text-[20px] font-bold tracking-[-0.02em]">
                  {profile.firstName}
                  {profile.age ? `, ${profile.age}` : ""}
                </div>
                <div className="text-[14px] text-white/55">{profile.location}</div>
              </div>
              <span className="flex items-center gap-[6px] rounded-full bg-white/[0.08] py-1 pl-1 pr-3 text-[12px] font-medium text-white/70">
                <MuseAvatar muse={muse} size={18} mood="idle" />
                {muse.name}&apos;s notes
              </span>
            </div>

            <p className="mt-5 text-[18px] leading-[26px] text-white/90">&ldquo;{summary.essence}&rdquo;</p>

            <div className="mt-5 space-y-4">
              {summary.sections.map((section, s) => (
                <motion.div key={section.title} {...rise(0.45 + s * 0.08)}>
                  <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">{section.title}</div>
                  <div className="mt-2 flex flex-wrap gap-[6px]">
                    {section.items.map((item) => (
                      <span key={item} className="rounded-full bg-white/[0.08] px-3 py-[6px] text-[14px] text-white/85">
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <button type="button" onClick={onTellMore} className="mt-5 flex items-center gap-1 text-[14px] font-semibold text-white/70 active:opacity-50">
              Something missing? Tell {muse.name}
              <svg width="7" height="12" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 1.5l5 5-5 5" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Who could be a great fit for you */}
        <motion.div className="mt-4 overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#15131C]" {...rise(0.7)}>
          <CityMap city={NEARBY_AREA} />
          <div className="px-5 pb-5 pt-1">
            <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">Who could be a great fit for you</div>
            <p className="mt-2 text-[17px] leading-[25px] text-white/90">
              From what you shared, about {summary.fitPeople.toLocaleString()} people on {BRAND.name} in {NEARBY_AREA} could be a
              great fit for you.
            </p>
            <p className="mt-2 text-[14px] leading-[20px] text-white/55">
              That&apos;s around {summary.fitPercent}% of people nearby.{" "}
              {summary.fitPercent <= 15
                ? "A short list, and that's a good thing. The right person only has to happen once."
                : "Tell Muse more and the picture gets sharper."}
            </p>
            <p className="mt-4 text-[12px] leading-[17px] text-white/35">
              An estimate from what you shared and who&apos;s active nearby.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="pb-safe absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A0810] via-[#0A0810]/95 to-transparent px-5 pt-10"
        {...rise(1.3)}
      >
        <Button onClick={onContinue}>Next: your best moments</Button>
        <div className="mt-1 flex justify-center">
          <TextButton onClick={onTellMore} className="text-white/70">
            Tell {muse.name} more
          </TextButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
