"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PEOPLE, type Interest, type Message, type Thread } from "@/lib/app-data";
import type { Muse } from "@/lib/mock-data";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { HeartIcon } from "@/components/photos/StoryScan";
import { TopFade } from "@/components/ui/TopFade";
import { Photo } from "@/components/ui/Photo";
import { SparkleIcon } from "@/components/ui/icons";

type Filter = "all" | Interest;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "likesYou", label: "Into you" },
  { id: "youLiked", label: "You're into" },
  { id: "mutual", label: "Mutual" },
];

/** What the list shows under a name. */
export function preview(m: Message | undefined, name: string): string {
  if (!m) return "";
  switch (m.kind) {
    case "text":
      return m.from === "me" ? `You: ${m.text}` : m.text;
    case "note":
      return m.from === "me" ? `Your note: ${m.text}` : m.text;
    case "media":
      return `${m.from === "me" ? "You sent" : `${name} sent`} ${m.media.length > 1 ? `${m.media.length} items` : m.media[0].kind === "video" ? "a video" : "a photo"}`;
    case "divider":
      return m.text;
    case "muse":
    case "museAsk":
    case "museVenues":
    case "museBooking":
      return "Muse is planning your date…";
    case "museBooked":
      return `Booked: ${m.booking.venue.name} · ${m.booking.when}`;
  }
}

export function ChatsTab({
  threads,
  muse,
  museLast,
  onOpen,
  onOpenMuse,
}: {
  threads: Thread[];
  muse: Muse;
  museLast: string;
  onOpen: (tid: string) => void;
  onOpenMuse: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = (f: Filter) => (f === "all" ? threads.length : threads.filter((t) => t.status === f).length);
  const shown = filter === "all" ? threads : threads.filter((t) => t.status === filter);

  return (
    <div className="absolute inset-0 bg-[#0B0A10]">
      <TopFade color="#0B0A10" />
      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto" style={{ paddingBottom: `calc(${TAB_BAR_SPACE} + 24px)` }}>
        <h1 className="px-5 pt-2 text-[34px] font-bold tracking-[-0.03em]">Chats</h1>

        {/* Muse, always first */}
        <motion.button
          type="button"
          onClick={onOpenMuse}
          whileTap={{ scale: 0.98 }}
          className="mx-4 mt-3 flex w-[calc(100%-32px)] items-center gap-3 rounded-[24px] border border-white/10 p-3 text-left"
          style={{ background: "linear-gradient(120deg, rgba(255,95,134,0.16), rgba(106,75,255,0.14))" }}
        >
          <MuseAvatar muse={muse} size={52} mood="idle" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[17px] font-semibold">{muse.name}</span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-[1px] text-[11px] font-semibold text-white/75">
                <SparkleIcon size={9} /> Your matchmaker
              </span>
            </span>
            <span className="mt-[2px] line-clamp-2 block text-[14px] leading-[19px] text-white/65">{museLast}</span>
          </span>
        </motion.button>

        {/* Filters */}
        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f.id)}
                className={`flex shrink-0 items-center gap-[6px] rounded-full px-[14px] py-[7px] text-[14px] font-medium transition-colors ${
                  on ? "bg-white text-black" : "bg-white/[0.08] text-white/80"
                }`}
              >
                {f.label}
                <span className={on ? "text-black/45" : "text-white/40"}>{count(f.id)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          {shown.map((t) => (
            <Row key={t.id} thread={t} onPress={() => onOpen(t.id)} />
          ))}
          {shown.length === 0 && <p className="px-8 py-12 text-center text-[15px] text-white/45">Nothing here yet.</p>}
        </div>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<Interest, string> = { mutual: "Mutual", likesYou: "Into you", youLiked: "Waiting" };

function Row({ thread, onPress }: { thread: Thread; onPress: () => void }) {
  const p = PEOPLE[thread.personId];
  const last = [...thread.messages].reverse().find((m) => m.kind !== "divider") ?? thread.messages[thread.messages.length - 1];
  const unread = thread.unread > 0;
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ backgroundColor: "rgba(255,255,255,0.05)" }}
      className="flex w-full items-center gap-3 px-4 py-[10px] text-left"
    >
      <span className="relative shrink-0">
        {thread.status === "likesYou" ? (
          <span className="block rounded-full p-[2.5px]" style={{ background: "conic-gradient(from 200deg, #FF8AA2, #FF3F6E, #C94BD8, #6A4BFF, #FF8AA2)" }}>
            <span className="block rounded-full bg-[#0B0A10] p-[2px]">
              <Photo src={p.avatar} initial={p.name[0]} className="h-[50px] w-[50px] rounded-full" />
            </span>
          </span>
        ) : (
          <Photo src={p.avatar} initial={p.name[0]} className="h-[59px] w-[59px] rounded-full" />
        )}
        {thread.status === "likesYou" && (
          <span className="absolute -bottom-[1px] -right-[1px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF3F6E] ring-2 ring-[#0B0A10]">
            <HeartIcon size={10} color="#fff" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 border-b border-white/[0.07] pb-[10px] pt-[2px]">
        <span className="flex items-center gap-2">
          <span className={`truncate text-[17px] ${unread ? "font-bold" : "font-semibold"}`}>{p.name}</span>
          <span
            className={`shrink-0 rounded-full px-[7px] py-[1px] text-[11px] font-semibold ${
              thread.status === "mutual" ? "bg-[#34C759]/15 text-[#5BE07F]" : thread.status === "likesYou" ? "bg-[#FF3F6E]/20 text-[#FF8AA2]" : "bg-white/10 text-white/55"
            }`}
          >
            {STATUS_LABEL[thread.status]}
          </span>
          <span className="ml-auto shrink-0 text-[13px] text-white/40">{thread.time}</span>
        </span>
        <span className="mt-[2px] flex items-center gap-2">
          <span className={`line-clamp-2 flex-1 text-[14px] leading-[19px] ${unread ? "text-white/90" : "text-white/50"}`}>
            {thread.typing ? <em className="not-italic text-[#FF8AA2]">typing…</em> : preview(last, p.name)}
          </span>
          {unread && <span className="h-[10px] w-[10px] shrink-0 rounded-full bg-[#FF3F6E]" />}
        </span>
        <span className="mt-[3px] block text-[11px] text-white/35">From {thread.origin}</span>
      </span>
    </motion.button>
  );
}
