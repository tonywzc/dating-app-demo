"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { PROFILE_PREFILL, type MetaSource } from "@/lib/mock-data";
import { formatBirthday } from "@/lib/format";
import { FacebookGlyph } from "@/components/ui/FacebookGlyph";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { Aurora } from "./AccountPicker";

type Phase = "check" | "guide";

const field = (id: string) => [...PROFILE_PREFILL.basics, ...PROFILE_PREFILL.life].find((f) => f.id === id)!;

/** What the guide card previews, in the order it fills in. */
const PREVIEW_ROWS: { label: string; value: string; source: MetaSource }[] = [
  { label: "First name", value: field("name").value, source: "instagram" },
  { label: "Birthday", value: formatBirthday(field("birthday").value), source: "facebook" },
  { label: "Lives in", value: field("location").value, source: "facebook" },
  { label: "Work", value: field("work").value, source: "facebook" },
  { label: "Interests", value: PROFILE_PREFILL.interests.slice(0, 3).join(" · "), source: "instagram" },
];

const ROW_STAGGER = 0.3;
const GUIDE_AT = 1700;
/** How long the filled card stays up before expanding into "About you". */
const HOLD_MS = 1400;

/** Celebrates finishing setup, then previews the auto-filled profile and hands off to "About you". */
export function AllSet({ name, onDone }: { name: string; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("check");

  useEffect(() => {
    const t = setTimeout(() => setPhase("guide"), GUIDE_AT);
    return () => clearTimeout(t);
  }, []);

  // Hand off once the last row has actually filled in, so it's never cut short.
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    if (!filled) return;
    const t = setTimeout(onDone, HOLD_MS);
    return () => clearTimeout(t);
  }, [filled, onDone]);

  const guiding = phase !== "check";

  return (
    <motion.div
      className="pt-safe pb-safe absolute inset-0 flex flex-col items-center bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      onClick={onDone}
    >
      <Aurora />

      <motion.div
        layout
        className={`relative flex flex-col items-center ${guiding ? "mt-10" : "mt-[210px]"}`}
        transition={{ layout: { type: "spring", stiffness: 160, damping: 24 } }}
      >
        <CheckBadge small={guiding} />
        <motion.h1
          layout="position"
          className="mt-6 text-center text-[32px] font-bold tracking-[-0.03em]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          You&apos;re all set, {name}.
        </motion.h1>
        <motion.p
          layout="position"
          className="mt-1 text-center text-[17px] text-white/60"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Welcome to {BRAND.name}.
        </motion.p>
      </motion.div>

      {guiding && (
        <div className="relative mt-8 w-full px-5">
          <motion.div
            className="mb-3 flex items-center gap-2 px-1 text-[13px] font-medium uppercase tracking-[0.06em] text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            Next up
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
              &rarr;
            </motion.span>
          </motion.div>

          <motion.div
            layoutId="about-card"
            className="overflow-hidden border border-white/10 bg-[#16151C]"
            style={{ borderRadius: 28 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <div>
                <div className="text-[22px] font-bold tracking-[-0.02em]">About you</div>
                <div className="mt-[2px] text-[13px] text-white/50">Filled in from your Meta accounts</div>
              </div>
              <div className="flex -space-x-2">
                <SourceBubble source="instagram" delay={0.2} />
                <SourceBubble source="facebook" delay={0.3} />
              </div>
            </div>
            <div className="px-5 pb-4">
              {PREVIEW_ROWS.map((row, i) => (
                <PreviewRow
                  key={row.label}
                  {...row}
                  delay={0.6 + i * ROW_STAGGER}
                  onShown={i === PREVIEW_ROWS.length - 1 ? () => setFilled(true) : undefined}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function CheckBadge({ small }: { small: boolean }) {
  const size = small ? 72 : 112;
  return (
    <motion.div layout className="relative" style={{ width: size, height: size }} transition={{ type: "spring", stiffness: 160, damping: 24 }}>
      {/* Burst */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-[8px] w-[8px] rounded-full"
            style={{ marginLeft: -4, marginTop: -4, background: i % 2 ? BRAND.colors.rose : BRAND.colors.violetTop }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x: Math.cos(a) * 110, y: Math.sin(a) * 110, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
            transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
          />
        );
      })}
      <motion.div
        className="absolute inset-0 flex items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.overlap} 55%, ${BRAND.colors.violet})`,
          boxShadow: "0 20px 60px -10px rgba(201,75,216,0.6)",
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
      >
        <svg width="46%" height="46%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function SourceBubble({ source, delay }: { source: MetaSource; delay: number }) {
  return (
    <motion.div
      className="flex h-[36px] w-[36px] items-center justify-center rounded-full border-2 border-[#16151C] bg-white"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20, delay }}
    >
      {source === "instagram" ? <InstagramGlyph size={20} /> : <FacebookGlyph size={22} />}
    </motion.div>
  );
}

function PreviewRow({
  label,
  value,
  source,
  delay,
  onShown,
}: {
  label: string;
  value: string;
  source: MetaSource;
  delay: number;
  onShown?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-white/[0.07] py-[11px]">
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-white/45">{label}</div>
        <div className="relative mt-[3px] h-[20px]">
          {/* Skeleton until the value arrives */}
          <motion.div
            className="absolute left-0 top-[4px] h-[12px] w-[60%] rounded-full bg-white/[0.08]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay, duration: 0.2 }}
          />
          <motion.div
            className="truncate text-[16px] font-medium"
            initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay, duration: 0.35 }}
            onAnimationComplete={onShown}
          >
            {value}
          </motion.div>
        </div>
      </div>
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: delay + 0.1, type: "spring", stiffness: 500, damping: 18 }}>
        {source === "instagram" ? <InstagramGlyph size={16} /> : <FacebookGlyph size={16} />}
      </motion.div>
    </div>
  );
}
