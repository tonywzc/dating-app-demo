"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { NEARBY_AREA, type Summary } from "@/lib/muse-script";
import type { Account, Muse } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { Button, TextButton } from "@/components/ui/Button";
import { TopFade } from "@/components/ui/TopFade";
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
  const focused = summary.fitPercent <= 12;
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

        {/* Your circle */}
        <motion.div className="mt-4 rounded-[30px] border border-white/[0.08] bg-[#15131C] p-5" {...rise(0.7)}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">Your circle on {BRAND.name}</span>
            <span
              className="rounded-full px-[10px] py-[3px] text-[12px] font-semibold"
              style={{ background: `linear-gradient(100deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
            >
              {focused ? "A focused circle" : "A wide, warm circle"}
            </span>
          </div>

          <p className="mt-4 text-[16px] text-white/70">You&apos;d be a great fit for</p>
          <div className="flex items-end gap-2">
            <CountUp to={summary.fitPercent} delay={1.1} />
            <p className="pb-[14px] text-[16px] leading-[21px] text-white/70">
              of people on {BRAND.name}
              <br />
              in {NEARBY_AREA}
            </p>
          </div>

          <DotField percent={summary.fitPercent} delay={1.1} />

          <p className="mt-5 text-[15px] leading-[22px] text-white/80">
            {focused ? (
              <>
                That&apos;s about <b className="text-white">{summary.fitPeople.toLocaleString()} people</b> who want what you want. You know what
                matters to you, and that&apos;s a gift. It means I can bring you fewer, better introductions, not an endless stack.
              </>
            ) : (
              <>
                That&apos;s about <b className="text-white">{summary.fitPeople.toLocaleString()} people</b>. Plenty of people would be glad to
                meet you, so I&apos;ll help you focus on the ones who really fit.
              </>
            )}
          </p>
          <p className="mt-3 text-[15px] font-semibold text-white">The right person only has to happen once.</p>

          <div className="mt-5 flex gap-3 rounded-[20px] bg-white/[0.05] p-4">
            <span
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full"
              style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
              </svg>
            </span>
            <div>
              <div className="text-[15px] font-semibold">What to expect</div>
              <p className="mt-[2px] text-[14px] leading-[20px] text-white/65">
                Two or three thoughtful introductions a day. Quiet days just mean I&apos;m being picky on your behalf.
              </p>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-[17px] text-white/40">
            Based on what you shared and who&apos;s active near you. Your circle grows as more people join, and as you tell {muse.name} more.
          </p>
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

function CountUp({ to, delay }: { to: number; delay: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, { duration: 1.2, delay, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [to, delay]);
  return (
    <span
      className="bg-clip-text text-[76px] font-bold leading-[84px] tracking-[-0.04em] text-transparent tabular-nums"
      style={{ backgroundImage: `linear-gradient(120deg, ${BRAND.colors.roseTop}, ${BRAND.colors.overlap}, ${BRAND.colors.violetTop})` }}
    >
      {value}%
    </span>
  );
}

/** 100 dots, one per percent of nearby members; the user's circle lights up. */
function DotField({ percent, delay }: { percent: number; delay: number }) {
  // Scatter the lit dots deterministically so it doesn't look like a progress bar.
  const lit = new Set(Array.from({ length: 100 }, (_, i) => (i * 37 + 11) % 100).slice(0, percent));
  return (
    <div className="mt-4 grid gap-[6px]" style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}>
      {Array.from({ length: 100 }, (_, i) => {
        const on = lit.has(i);
        return (
          <motion.span
            key={i}
            className="aspect-square rounded-full"
            initial={{ scale: 0.6, backgroundColor: "rgba(255,255,255,0.12)" }}
            animate={on ? { scale: [0.6, 1.5, 1], backgroundColor: "#FF6A88" } : { scale: 1, backgroundColor: "rgba(255,255,255,0.12)" }}
            transition={{ delay: on ? delay + ([...lit].indexOf(i) / Math.max(percent, 1)) * 1.1 : delay * 0.5 + i * 0.004, duration: on ? 0.5 : 0.3 }}
            style={on ? { boxShadow: "0 0 10px rgba(255,106,136,0.7)" } : undefined}
          />
        );
      })}
    </div>
  );
}
