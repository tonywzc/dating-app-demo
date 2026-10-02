"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BrandMark } from "@/components/brand/BrandMark";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { Photo } from "@/components/ui/Photo";
import type { Banner } from "@/components/chats/useChats";

const SHOW_MS = 4500;

/** In-app notification banner (iOS style). Tap to open, swipe up to dismiss. */
export function BannerHost({ banner, onDismiss }: { banner: Banner | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(onDismiss, SHOW_MS);
    return () => clearTimeout(t);
  }, [banner, onDismiss]);

  return (
    <AnimatePresence>
      {banner && (
        <motion.button
          key={banner.id}
          type="button"
          className="absolute inset-x-[10px] z-[65] flex items-center gap-3 rounded-[26px] border border-white/10 px-[14px] py-[12px] text-left shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{ top: "calc(var(--safe-top) - 6px)", background: "rgba(40,38,48,0.82)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)" }}
          initial={{ y: -140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -140, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.6, bottom: 0.1 }}
          onDragEnd={(_, info) => info.offset.y < -30 && onDismiss()}
          onClick={() => {
            banner.onOpen?.();
            onDismiss();
          }}
        >
          <span className="relative shrink-0">
            {banner.muse ? (
              <MuseAvatar size={38} mood="idle" />
            ) : banner.avatar ? (
              <Photo src={banner.avatar} className="h-[38px] w-[38px] rounded-full" />
            ) : null}
            <span className="absolute -bottom-[3px] -right-[3px] flex h-[18px] w-[18px] items-center justify-center rounded-[6px] bg-[#0B0A10]">
              <BrandMark width={12} />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[15px] font-semibold">{banner.title}</span>
              <span className="shrink-0 text-[12px] text-white/45">now</span>
            </span>
            <span className="mt-[1px] block text-[14px] leading-[19px] text-white/75">{banner.body}</span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
