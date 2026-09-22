"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { DEFAULT_MUSE, PROFILE_PHOTO, TOP_STORIES } from "@/lib/mock-data";
import { AppIcon } from "@/components/brand/AppIcon";
import { MuseAvatar } from "@/components/muse/MuseAvatar";

// Full-screen example scenes, one per permission. Each shows only that
// permission's use cases, so the examples read as "this is what it's for".

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] as const },
});

/** Lock screen with the three kinds of notifications: a match, a message, an event. */
export function NotificationsHero() {
  const banners = [
    { title: "It's a match", body: "You and Maya both said yes. Say hi?" },
    { title: "Alex sent a message", body: "“Okay, that hiking spot sounds amazing…”" },
    { title: "Rooftop mixer tonight", body: "7 PM in Hayes Valley. 12 people you'd like are going." },
  ];
  return (
    <div className="flex w-full flex-col items-center">
      <motion.div className="text-center" {...enter(0)}>
        <div className="text-[15px] font-medium text-white/60">Monday, September 22</div>
        <div className="text-[76px] font-bold leading-[80px] tracking-[-0.03em] text-white/90">9:41</div>
      </motion.div>
      <div className="mt-8 w-full space-y-[10px]">
        {banners.map((b, i) => (
          <motion.div key={b.title} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.1] p-3 backdrop-blur-2xl" {...enter(0.25 + i * 0.18)}>
            <AppIcon size={38} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] font-semibold">{b.title}</span>
                <span className="text-[12px] text-white/45">{i === 0 ? "now" : `${i * 12}m ago`}</span>
              </div>
              <p className="mt-[1px] truncate text-[13px] text-white/70">{b.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Muse listening, with the two things people talk about: themselves and their type. */
export function VoiceHero() {
  return (
    <div className="flex w-full flex-col items-center">
      <motion.div {...enter(0)}>
        <MuseAvatar muse={DEFAULT_MUSE} size={120} mood="listening" />
      </motion.div>
      <motion.div className="mt-7" {...enter(0.15)}>
        <Waveform bars={30} height={30} />
      </motion.div>
      <div className="mt-8 w-full space-y-3">
        <Bubble label="About you" delay={0.35}>
          &ldquo;I&apos;m happiest on a trail by 8 AM, then cooking for friends.&rdquo;
        </Bubble>
        <Bubble label="Your type" delay={0.55}>
          &ldquo;Someone curious and kind, who&apos;s close to their family.&rdquo;
        </Bubble>
      </div>
    </div>
  );
}

function Bubble({ label, delay, children }: { label: string; delay: number; children: ReactNode }) {
  return (
    <motion.div className="rounded-[20px] border border-white/10 bg-white/[0.07] px-4 py-3" {...enter(delay)}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#FF8AA2]">{label}</div>
      <p className="mt-1 text-[15px] leading-[21px] text-white/85">{children}</p>
    </motion.div>
  );
}

/** Two uses side by side: adding moments, and a selfie to verify it's really you. */
export function PhotosHero() {
  const fan = TOP_STORIES.slice(0, 3);
  return (
    <div className="grid w-full grid-cols-2 gap-4">
      <motion.div className="flex flex-col items-center" {...enter(0)}>
        <div className="relative h-[220px] w-full">
          {fan.map((s, i) => (
            <motion.div
              key={s.id}
              className="absolute top-3 h-[180px] w-[110px] overflow-hidden rounded-[16px] border-2 border-[#0B0A10] shadow-xl"
              style={{ left: `calc(50% - 55px + ${(i - 1) * 26}px)`, zIndex: i === 1 ? 2 : 1 }}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: (i - 1) * 10, opacity: 1, y: i === 1 ? -6 : 6 }}
              transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.15 + i * 0.08 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" className="h-full w-full object-cover" />
            </motion.div>
          ))}
        </div>
        <div className="mt-2 text-center text-[15px] font-semibold">Add your moments</div>
      </motion.div>

      <motion.div className="flex flex-col items-center" {...enter(0.2)}>
        <div className="relative mt-3 h-[196px] w-[140px] overflow-hidden rounded-[22px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PROFILE_PHOTO} alt="" className="h-full w-full object-cover" />
          <Viewfinder />
          <motion.span
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#0A84FF] px-3 py-1 text-[12px] font-semibold"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <svg width="10" height="8" viewBox="0 0 12 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 5.2l3 3 6-6.4" />
            </svg>
            Verified
          </motion.span>
        </div>
        <div className="mt-[26px] text-center text-[15px] font-semibold">Verify it&apos;s you</div>
      </motion.div>
    </div>
  );
}

function Viewfinder() {
  const corner = "absolute h-[18px] w-[18px] border-white";
  return (
    <motion.div className="absolute inset-[10px]" animate={{ scale: [1, 0.95, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
      <span className={`${corner} left-0 top-0 rounded-tl-[8px] border-l-[3px] border-t-[3px]`} />
      <span className={`${corner} right-0 top-0 rounded-tr-[8px] border-r-[3px] border-t-[3px]`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-[8px] border-b-[3px] border-l-[3px]`} />
      <span className={`${corner} bottom-0 right-0 rounded-br-[8px] border-b-[3px] border-r-[3px]`} />
    </motion.div>
  );
}

/** The side of the phone: hold the Action Button, Muse starts listening. */
export function ShortcutHero() {
  return (
    <div className="flex w-full flex-col items-center">
      <motion.div {...enter(0)}>
        <ActionButtonArt size={2.4} />
      </motion.div>
      <motion.div className="mt-10 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] py-2 pl-2 pr-5" {...enter(0.25)}>
        <MuseAvatar muse={DEFAULT_MUSE} size={32} mood="listening" />
        <Waveform bars={14} height={18} />
        <span className="text-[14px] font-medium text-white/80">Listening&hellip;</span>
      </motion.div>
    </div>
  );
}

/** Animated voice level bars. */
export function Waveform({ bars, height, active = true }: { bars: number; height: number; active?: boolean }) {
  return (
    <div className="flex items-center gap-[3px]" style={{ height }}>
      {Array.from({ length: bars }, (_, b) => {
        // Deterministic pseudo-random shape per bar.
        const peak = 0.35 + (((b * 37) % 11) / 11) * 0.65;
        return (
          <motion.span
            key={b}
            className="w-[3px] rounded-full bg-white/80"
            animate={active ? { height: [height * 0.2, height * peak, height * 0.3] } : { height: 3 }}
            transition={{ duration: 0.7 + (b % 5) * 0.12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: (b % 7) * 0.05 }}
          />
        );
      })}
    </div>
  );
}

export function ActionButtonArt({ size = 1 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: 46 * size, height: 70 * size }}>
      <div
        className="absolute inset-y-0 right-0 rounded-[12px] border-2 border-white/35"
        style={{ width: 38 * size, borderRadius: 12 * size }}
      />
      <motion.span
        className="absolute left-0 rounded-full"
        style={{
          top: 14 * size,
          width: 6 * size,
          height: 14 * size,
          background: `linear-gradient(180deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})`,
        }}
        animate={{ x: [0, 3, 3, 0], boxShadow: ["0 0 0 0 rgba(255,63,110,0)", "0 0 0 6px rgba(255,63,110,0.25)", "0 0 0 6px rgba(255,63,110,0.25)", "0 0 0 0 rgba(255,63,110,0)"] }}
        transition={{ duration: 1.8, times: [0, 0.2, 0.75, 1], repeat: Infinity }}
      />
      <motion.div
        className="absolute flex items-center justify-center"
        style={{ right: 10 * size, top: 24 * size }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.8, times: [0, 0.25, 0.75, 1], repeat: Infinity }}
      >
        <MicGlyph size={16 * size} />
      </motion.div>
    </div>
  );
}

export function MicGlyph({ size, color = "#fff" }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill={color} stroke="none" />
      <path d="M5 11a7 7 0 0014 0M12 18v3.5" />
    </svg>
  );
}
