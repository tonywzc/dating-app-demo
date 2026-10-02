"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { TimelineEntry, TimelineKind } from "@/lib/app-data";
import { BrandMark } from "@/components/brand/BrandMark";
import { MaskGlyph } from "@/components/nearby/NearbyMap";
import { HeartIcon } from "@/components/photos/StoryScan";
import { Photo } from "@/components/ui/Photo";
import { CalendarIcon, PartyIcon } from "@/components/ui/icons";

const KINDS: { id: TimelineKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "date", label: "Dates" },
  { id: "event", label: "Twine events" },
  { id: "blind", label: "Blind dates" },
  { id: "hosted", label: "Hosted" },
];

export function KindIcon({ kind, size = 14 }: { kind: TimelineKind; size?: number }) {
  if (kind === "date") return <CalendarIcon size={size} />;
  if (kind === "blind") return <MaskGlyph size={size + 2} />;
  if (kind === "hosted") return <PartyIcon size={size} />;
  return <BrandMark width={size} tone="white" />;
}

const KIND_BG: Record<TimelineKind, string> = { date: "#FF3F6E", event: "#C94BD8", blind: "#6A4BFF", hosted: "#FF8A3D" };

export function Hearts({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-[2px]" aria-label={`${value} of 5 hearts`}>
      {Array.from({ length: 5 }, (_, i) => (
        <HeartIcon key={i} size={size} color={i < value ? "#FF3F6E" : "rgba(255,255,255,0.18)"} />
      ))}
    </span>
  );
}

/** Where you've been and with whom, sorted into kinds automatically. */
export function Timeline({ entries, onCheckIn }: { entries: TimelineEntry[]; onCheckIn: (e: TimelineEntry) => void }) {
  const [kind, setKind] = useState<TimelineKind | "all">("all");
  const shown = kind === "all" ? entries : entries.filter((e) => e.kind === kind);
  const count = (k: TimelineKind | "all") => (k === "all" ? entries.length : entries.filter((e) => e.kind === k).length);

  return (
    <section className="mt-6">
      <h2 className="px-3 pb-2 text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">Timeline</h2>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
        {KINDS.filter((k) => k.id === "all" || count(k.id) > 0).map((k) => {
          const on = kind === k.id;
          return (
            <button
              key={k.id}
              type="button"
              aria-pressed={on}
              onClick={() => setKind(k.id)}
              className={`flex h-[40px] shrink-0 items-center gap-[6px] rounded-full px-4 text-[15px] font-medium ${on ? "bg-white text-black" : "bg-white/[0.08] text-white/80"}`}
            >
              {k.label}
              <span className={on ? "text-black/45" : "text-white/40"}>{count(k.id)}</span>
            </button>
          );
        })}
      </div>
      <div className="relative space-y-2">
        {shown.map((e) => (
          <motion.button
            key={e.id}
            layout
            type="button"
            onClick={() => e.status === "pending" && onCheckIn(e)}
            whileTap={e.status === "pending" ? { scale: 0.98 } : undefined}
            className="flex w-full items-center gap-3 rounded-[20px] border border-white/[0.07] bg-white/[0.04] p-2 pr-4 text-left"
          >
            <span className="relative shrink-0">
              <Photo src={e.photo} className="h-[60px] w-[60px] rounded-[14px]" />
              <span className="absolute -bottom-1 -right-1 flex h-[24px] w-[24px] items-center justify-center rounded-full text-white ring-2 ring-[#0B0A10]" style={{ background: KIND_BG[e.kind] }}>
                <KindIcon kind={e.kind} size={12} />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-semibold">{e.title}</span>
              <span className="mt-[2px] flex items-center gap-2 text-[13px] text-white/50">
                {e.when}
                {e.with.length > 0 && (
                  <span className="flex -space-x-2">
                    {e.with.slice(0, 3).map((f) => (
                      <Photo key={f} src={f} className="h-[20px] w-[20px] rounded-full ring-2 ring-[#16141C]" />
                    ))}
                  </span>
                )}
              </span>
            </span>
            {e.status === "went" && <Hearts value={e.rating ?? 0} />}
            {e.status === "missed" && <span className="text-[13px] text-white/40">Didn&apos;t go</span>}
            {e.status === "upcoming" && <span className="rounded-full bg-white/10 px-3 py-[5px] text-[13px] font-semibold">Upcoming</span>}
            {e.status === "pending" && <span className="rounded-full bg-[#FF3F6E] px-3 py-[6px] text-[13px] font-semibold">Did you go?</span>}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
