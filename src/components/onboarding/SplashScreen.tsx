"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { BRAND, markGeometry, type Strand } from "@/lib/brand";
import { MEMORY_PHOTOS } from "@/lib/mock-data";
import { BrandMark } from "@/components/brand/BrandMark";
import { FromMeta } from "@/components/ui/FromMeta";

const MARK_W = 150;
const CARD_W = 148;
const CARD_H = 192;

// Loose, hand-placed stack so it feels like a pile of printed photos.
const STACK = [
  { x: -12, y: 8, r: -10 },
  { x: 14, y: -6, r: 8 },
  { x: -6, y: -12, r: -4 },
  { x: 10, y: 10, r: 12 },
  { x: -16, y: -2, r: -13 },
  { x: 6, y: 6, r: 5 },
  { x: -4, y: -8, r: -7 },
  { x: 12, y: 2, r: 9 },
  { x: -8, y: 4, r: -3 },
  { x: 0, y: 0, r: 2 },
];

type Phase = "loading" | "stack" | "merge" | "mark" | "title";

// Pauses between beats, in ms. Each beat starts when the previous animation
// actually finishes, so a slow or throttled device never skips the stack.
const HOLD = { stack: 250, merge: 60, mark: 350, title: 1500 };

const EASE_MERGE = [0.7, 0, 0.2, 1] as const;

/** `?speed=0.25` plays the launch animation in slow motion (for reviews). */
function slowdown() {
  const speed = Number(new URLSearchParams(window.location.search).get("speed"));
  return speed > 0 ? 1 / speed : 1;
}

function preload(urls: string[], timeoutMs: number) {
  const all = Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  );
  return Promise.race([all, new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [k] = useState(slowdown);
  const geometry = markGeometry(MARK_W);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const after = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms * k));
  const advance = (from: Phase, to: Phase, ms: number) =>
    after(ms, () => setPhase((p) => (p === from ? to : p)));

  useEffect(() => {
    let cancelled = false;
    preload(MEMORY_PHOTOS, 1800).then(() => !cancelled && setPhase("stack"));
    const pending = timers.current;
    return () => {
      cancelled = true;
      pending.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (phase === "mark") advance("mark", "title", HOLD.mark);
    if (phase === "title") after(HOLD.title, onDone);
    // advance/after only schedule timers; re-running on their identity would double-schedule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, onDone]);

  // The top card lands last in the stack; the bottom card finishes the merge last.
  const onCardSettled = (index: number) => {
    if (phase === "stack" && index === MEMORY_PHOTOS.length - 1) advance("stack", "merge", HOLD.stack);
    if (phase === "merge" && index === 0) advance("merge", "mark", HOLD.merge);
  };

  const merged = phase === "merge" || phase === "mark" || phase === "title";
  const showMark = phase === "mark" || phase === "title";
  const showTitle = phase === "title";

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-ink"
      onClick={() => phase !== "loading" && onDone()}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      {/* Glow that blooms as the strands meet */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[44%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${BRAND.colors.overlap}55, ${BRAND.colors.violet}22 55%, transparent)`,
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={showMark ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.9 * k, ease: "easeOut" }}
      />

      {/* Anchor at the mark's center */}
      <div className="absolute left-1/2 top-[44%]">
        {MEMORY_PHOTOS.map((src, i) => {
          const strand = i % 2 === 0 ? geometry.left : geometry.right;
          return (
            <MemoryCard
              key={src}
              index={i}
              src={src}
              strand={strand}
              side={i % 2 === 0 ? "left" : "right"}
              phase={phase}
              merged={merged}
              hidden={showMark}
              k={k}
              onSettled={onCardSettled}
            />
          );
        })}

        {/* Shockwave ring at the moment of merging */}
        <motion.div
          className="pointer-events-none absolute rounded-full border border-white/40"
          style={{ left: -60, top: -60, width: 120, height: 120 }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={showMark ? { opacity: [0, 0.7, 0], scale: [0.6, 2.6, 3.2] } : { opacity: 0 }}
          transition={{ duration: 0.9 * k, ease: "easeOut" }}
        />

        {showMark && (
          <motion.div
            layoutId="brand-mark"
            className="absolute"
            style={{ left: -geometry.width / 2, top: -geometry.height / 2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: [1, 1.09, 1] }}
            transition={{
              opacity: { duration: 0.2 * k },
              scale: { duration: 0.55 * k, times: [0, 0.4, 1], ease: "easeInOut" },
            }}
          >
            <BrandMark width={MARK_W} />
          </motion.div>
        )}
      </div>

      {/* Wordmark */}
      <div className="absolute inset-x-0 top-[calc(44%+104px)] flex flex-col items-center">
        {showTitle && (
          <>
            <motion.h1
              layoutId="brand-name"
              className="text-[44px] font-bold tracking-[-0.03em] text-white"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 * k, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {BRAND.name}
            </motion.h1>
            <motion.p
              className="mt-1 text-[16px] text-white/60"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 * k, delay: 0.12 * k, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {BRAND.tagline}
            </motion.p>
          </>
        )}
      </div>

      <motion.div
        className="pb-safe absolute inset-x-0 bottom-[18px] flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: showTitle ? 1 : 0 }}
        transition={{ duration: 0.5 * k, delay: 0.25 * k }}
      >
        <FromMeta />
      </motion.div>
    </motion.div>
  );
}

function MemoryCard({
  index,
  src,
  strand,
  side,
  phase,
  merged,
  hidden,
  k,
  onSettled,
}: {
  index: number;
  src: string;
  strand: Strand;
  side: "left" | "right";
  phase: Phase;
  merged: boolean;
  hidden: boolean;
  k: number;
  onSettled: (index: number) => void;
}) {
  const stack = STACK[index];
  // Fly in from all around the screen (golden-angle spread).
  const angle = (index * 137.5 * Math.PI) / 180;
  const from = { x: Math.cos(angle) * 560, y: Math.sin(angle) * 620 };

  const stacked = {
    left: stack.x - CARD_W / 2,
    top: stack.y - CARD_H / 2,
    width: CARD_W,
    height: CARD_H,
    rotate: stack.r,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    opacity: 1,
    scale: 1,
  };

  const [tl, tr, br, bl] = strand.radii;
  const strandShape = {
    left: strand.cx - strand.width / 2,
    top: strand.cy - strand.height / 2,
    width: strand.width,
    height: strand.height,
    rotate: strand.rotate,
    borderTopLeftRadius: tl,
    borderTopRightRadius: tr,
    borderBottomRightRadius: br,
    borderBottomLeftRadius: bl,
    opacity: hidden ? 0 : 1,
    scale: 1,
  };

  const overlay =
    side === "left"
      ? `linear-gradient(145deg, ${BRAND.colors.roseTop}, ${BRAND.colors.rose})`
      : `linear-gradient(215deg, ${BRAND.colors.violetTop}, ${BRAND.colors.violet})`;

  return (
    <motion.div
      className="absolute overflow-hidden bg-neutral-800"
      style={{
        zIndex: index,
        boxShadow: merged ? "none" : "0 12px 30px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
      }}
      initial={{
        ...stacked,
        left: from.x - CARD_W / 2,
        top: from.y - CARD_H / 2,
        rotate: stack.r * 3,
        scale: 1.15,
        opacity: 0,
      }}
      animate={phase === "loading" ? undefined : merged ? strandShape : stacked}
      onAnimationComplete={() => onSettled(index)}
      transition={
        merged
          ? {
              duration: 0.75 * k,
              ease: EASE_MERGE,
              delay: (MEMORY_PHOTOS.length - 1 - index) * 0.018 * k,
              opacity: { duration: 0.2 * k, delay: 0.15 * k },
            }
          : {
              type: "spring",
              duration: 0.6 * k,
              bounce: 0.22,
              delay: index * 0.1 * k,
              opacity: { duration: 0.12 * k, delay: index * 0.1 * k },
            }
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} className="h-full w-full object-cover" />
      <motion.div
        className="absolute inset-0"
        style={{ background: overlay }}
        initial={{ opacity: 0 }}
        animate={{ opacity: merged ? 1 : 0 }}
        transition={{ duration: 0.45 * k, delay: merged ? 0.3 * k : 0 }}
      />
    </motion.div>
  );
}
