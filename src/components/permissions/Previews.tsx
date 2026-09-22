"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { CAMERA_ROLL } from "@/lib/mock-data";
import { AppIcon } from "@/components/brand/AppIcon";

/** Advances an index every `ms` milliseconds. */
function useTicker(length: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms]);
  return i;
}

const NOTIFICATIONS = [
  { title: "It's a match", body: "You and Maya both said yes. Say hi before the day's over." },
  { title: "Alex sent you a voice note", body: "“Okay, that hiking spot sounds amazing…”" },
  { title: "Rooftop mixer tonight", body: "Starts at 7 PM in Hayes Valley. 12 people you'd like are going." },
];

export function NotificationPreview() {
  const i = useTicker(NOTIFICATIONS.length, 2600);
  const n = NOTIFICATIONS[i];
  return (
    <div className="relative h-[92px]">
      {/* Banner peeking out behind */}
      <div className="absolute inset-x-4 top-[14px] h-[70px] rounded-[20px] bg-white/[0.06]" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={i}
          className="absolute inset-x-0 top-0 flex gap-3 rounded-[22px] border border-white/10 bg-[#2B2A31]/95 p-3 backdrop-blur-xl"
          initial={{ y: -24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 14, opacity: 0, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <AppIcon size={38} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold">{n.title}</span>
              <span className="text-[12px] text-white/45">now</span>
            </div>
            <p className="mt-[1px] line-clamp-2 text-[13px] leading-[17px] text-white/70">{n.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const PHRASES = [
  "I'm happiest outdoors, usually on a trail by 8 AM…",
  "Looking for someone curious, kind, and a little competitive…",
  "Big on family. Bigger on Sunday dim sum…",
];

export function VoicePreview() {
  const i = useTicker(PHRASES.length, 3200);
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.05] p-3">
      <div
        className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full"
        style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
      >
        <MicGlyph size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <Waveform bars={26} height={22} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={i}
            className="mt-1 truncate text-[13px] text-white/70"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {PHRASES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
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

export function PhotosPreview() {
  return (
    <div className="flex h-[96px] items-center justify-center gap-4">
      <div className="relative h-[92px] w-[150px]">
        {CAMERA_ROLL.map((src, i) => (
          <motion.div
            key={src}
            className="absolute top-1 h-[84px] w-[66px] overflow-hidden rounded-[12px] border-2 border-[#1c1b22] shadow-lg"
            style={{ left: 8 + i * 38, zIndex: i === 1 ? 2 : 1 }}
            initial={{ rotate: 0, y: 6, opacity: 0 }}
            animate={{ rotate: (i - 1) * 9, y: i === 1 ? -2 : 4, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 + i * 0.08 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </motion.div>
        ))}
      </div>
      <div className="relative flex h-[84px] w-[70px] items-center justify-center rounded-[14px] bg-white/[0.06]">
        <Viewfinder />
        <svg width="30" height="34" viewBox="0 0 30 34" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
          <circle cx="15" cy="11" r="7" />
          <path d="M2 33c1.5-7 6.5-11 13-11s11.5 4 13 11" />
        </svg>
        <motion.span
          className="absolute -bottom-2 -right-2 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-[#1c1b22] bg-[#0A84FF]"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <svg width="11" height="9" viewBox="0 0 12 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 5.2l3 3 6-6.4" />
          </svg>
        </motion.span>
      </div>
    </div>
  );
}

function Viewfinder() {
  const corner = "absolute h-[12px] w-[12px] border-white/80";
  return (
    <motion.div
      className="absolute inset-[6px]"
      animate={{ scale: [1, 0.94, 1] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className={`${corner} left-0 top-0 rounded-tl-[6px] border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-0 rounded-tr-[6px] border-r-2 border-t-2`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-[6px] border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 rounded-br-[6px] border-b-2 border-r-2`} />
    </motion.div>
  );
}

/** Side view of the phone with the Action Button being pressed. */
export function ShortcutPreview() {
  return (
    <div className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.05] p-3">
      <ActionButtonArt />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold">Hold, talk, let go</div>
        <p className="mt-[2px] text-[13px] leading-[17px] text-white/60">
          Your agent listens while you hold, even with {BRAND.name} closed.
        </p>
      </div>
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
