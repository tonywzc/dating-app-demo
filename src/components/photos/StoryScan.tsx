"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { OTHER_STORIES, TOP_STORIES, type Media, type Muse } from "@/lib/mock-data";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { IntimateBackdrop } from "@/components/muse/IntimateBackdrop";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { MediaTile } from "./MediaTile";

const COLS = 4;
const ROWS = 3;
const GAP = 8;
const TILE_W = (402 - 32 - GAP * (COLS - 1)) / COLS;
const TILE_H = TILE_W * (16 / 9);

// Where each top story sits in the archive wall, in Muse's ranking order.
const PICK_SLOTS = [5, 2, 8, 11, 0, 6];
const PICK_MS = 480;
const START_MS = 800;
const SCAN_MS = START_MS + TOP_STORIES.length * PICK_MS;

const WALL: { media: Media; rank: number }[] = Array.from({ length: COLS * ROWS }, (_, i) => {
  const rank = PICK_SLOTS.indexOf(i);
  return rank >= 0 ? { media: TOP_STORIES[rank], rank } : { media: OTHER_STORIES[i % OTHER_STORIES.length], rank: -1 };
});

/** Muse goes through the Instagram Story archive and finds the stories friends loved most. */
export function StoryScan({ muse, onDone }: { muse: Muse; onDone: () => void }) {
  const [found, setFound] = useState(0);

  useEffect(() => {
    const timers = TOP_STORIES.map((_, i) => setTimeout(() => setFound(i + 1), START_MS + i * PICK_MS));
    timers.push(setTimeout(onDone, SCAN_MS + 1000));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const done = found >= TOP_STORIES.length;
  const focus = found > 0 && !done ? PICK_SLOTS[found - 1] : null;

  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }}>
      <IntimateBackdrop mode="speaking" />
      <div className="pt-safe relative flex h-full flex-col px-4">
        <div className="flex items-center gap-3 px-2 pt-6">
          <MuseAvatar muse={muse} size={44} mood={done ? "idle" : "thinking"} />
          <div>
            <div className="text-[19px] font-semibold tracking-[-0.01em]">
              {done ? "Your friends loved these." : "Looking through your stories…"}
            </div>
            <div className="mt-[2px] text-[13px] text-white/55">Finding the moments that say the most about you</div>
          </div>
        </div>

        <div className="mx-2 mt-5 rounded-[16px] border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[14px] font-semibold">
            <span className="flex items-center gap-2">
              <InstagramGlyph size={15} />
              Story archive
            </span>
            <span className="text-[12px] font-medium text-white/50">312 stories</span>
          </div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-white/80"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: SCAN_MS / 1000, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="relative mt-5" style={{ height: TILE_H * ROWS + GAP * (ROWS - 1) }}>
          {WALL.map(({ media, rank }, i) => {
            const lit = rank >= 0 && rank < found;
            return (
              <motion.div
                key={`${media.id}-${i}`}
                layoutId={rank >= 0 ? `story-${media.id}` : undefined}
                className="absolute overflow-hidden rounded-[12px]"
                style={{
                  left: (i % COLS) * (TILE_W + GAP),
                  top: Math.floor(i / COLS) * (TILE_H + GAP),
                  width: TILE_W,
                  height: TILE_H,
                  zIndex: lit ? 2 : 1,
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{
                  opacity: lit ? 1 : done ? 0.15 : 0.5,
                  y: 0,
                  scale: focus === i ? 1.08 : 1,
                  boxShadow: lit ? "0 0 0 2px #FF8AA2, 0 10px 30px -6px rgba(255,79,123,0.6)" : "0 0 0 0 rgba(0,0,0,0)",
                }}
                transition={{
                  opacity: { duration: 0.4, delay: found === 0 ? i * 0.04 : 0 },
                  y: { duration: 0.5, delay: i * 0.04 },
                  scale: { type: "spring", stiffness: 400, damping: 22 },
                }}
              >
                <MediaTile media={media} className="h-full w-full" showCaption={false} showSource={false} playing={false} />
                {lit && rank >= 0 && (
                  <motion.span
                    className="absolute bottom-[6px] left-[6px] flex items-center gap-[3px] rounded-full bg-white px-[7px] py-[2px] text-[11px] font-bold text-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <HeartIcon />
                    {TOP_STORIES[rank].likes}
                  </motion.span>
                )}
              </motion.div>
            );
          })}

          {/* Muse's attention, moving from story to story */}
          {focus !== null && (
            <motion.div
              className="pointer-events-none absolute z-10 rounded-full"
              style={{ width: 180, height: 180, background: "radial-gradient(closest-side, rgba(255,200,180,0.35), transparent)" }}
              animate={{
                left: (focus % COLS) * (TILE_W + GAP) + TILE_W / 2 - 90,
                top: Math.floor(focus / COLS) * (TILE_H + GAP) + TILE_H / 2 - 90,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function HeartIcon({ size = 10, color = "#FF3F6E" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
