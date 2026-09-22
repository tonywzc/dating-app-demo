"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";

const SPRING = { type: "spring", stiffness: 420, damping: 40 } as const;

/**
 * iOS-style bottom sheet, scoped to the phone screen. Drag the grabber down to dismiss.
 * `large` is a fixed 75%-height sheet, edge to edge, with its content laid out in a column.
 */
export function Sheet({
  open,
  onClose,
  children,
  surface = "dark",
  size = "auto",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  surface?: "dark" | "light";
  size?: "auto" | "large";
}) {
  const drag = useDragControls();
  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-40">
          <motion.div
            className="absolute inset-0 bg-black/55"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            role="dialog"
            className={`pb-safe absolute px-5 pt-2 ${
              size === "large" ? "inset-x-0 bottom-0 flex h-[75%] flex-col rounded-t-[38px]" : "inset-x-[8px] bottom-[8px] rounded-[38px]"
            } ${surface === "dark" ? "bg-[#1C1B22] text-white" : "bg-white text-black"}`}
            style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.35)" }}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={SPRING}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="-mx-5 -mt-2 flex h-[26px] shrink-0 touch-none cursor-grab items-center justify-center" onPointerDown={(e) => drag.start(e)}>
              <div className="h-[5px] w-[36px] rounded-full bg-current opacity-20" />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
