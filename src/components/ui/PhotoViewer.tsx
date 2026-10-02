"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Photo } from "./Photo";
import { CloseIcon } from "./icons";

export type ViewerState = { photos: string[]; index: number } | null;

/**
 * Full-screen photos. Swipe sideways to browse, drag down or tap × to close.
 * Rendered into the phone screen so it covers the tab bar too.
 */
export function PhotoViewer({ state, onClose }: { state: ViewerState; onClose: () => void }) {
  // The app renders client-side only, so the phone screen exists by now.
  const screen = document.querySelector(".screen");
  if (!screen) return null;
  return createPortal(
    <AnimatePresence>{state && <Viewer key="viewer" photos={state.photos} start={state.index} onClose={onClose} />}</AnimatePresence>,
    screen,
  );
}

function Viewer({ photos, start, onClose }: { photos: string[]; start: number; onClose: () => void }) {
  const [[index, dir], setPage] = useState<[number, number]>([start, 0]);
  const go = (next: number) => next >= 0 && next < photos.length && setPage([next, next > index ? 1 : -1]);

  return (
    <motion.div className="absolute inset-0 z-[58] bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={index}
          custom={dir}
          className="absolute inset-0 flex items-center"
          initial={{ x: dir >= 0 ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: dir >= 0 ? "-100%" : "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 36 }}
          drag
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120) return onClose();
            if (info.offset.x < -70) go(index + 1);
            else if (info.offset.x > 70) go(index - 1);
          }}
        >
          <Photo src={photos[index]} className="h-full w-full object-contain" />
        </motion.div>
      </AnimatePresence>

      <div className="pt-safe absolute inset-x-0 top-0 flex items-center justify-between px-4">
        <div className="flex gap-[5px]">
          {photos.length > 1 &&
            photos.map((_, i) => <span key={i} className={`h-[6px] rounded-full transition-all ${i === index ? "w-[18px] bg-white" : "w-[6px] bg-white/40"}`} />)}
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <CloseIcon size={15} />
        </button>
      </div>
    </motion.div>
  );
}
