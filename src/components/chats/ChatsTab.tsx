"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MUSE_HINTS, PEOPLE, type Interest, type Message, type Thread } from "@/lib/app-data";
import { ChatBubbleIcon, ClockIcon, MoonIcon, SparkleIcon } from "@/components/ui/icons";
import type { Muse } from "@/lib/mock-data";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { HeartIcon } from "@/components/photos/StoryScan";
import { TopFade } from "@/components/ui/TopFade";
import { Photo } from "@/components/ui/Photo";

type Filter = "all" | Interest;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mutual", label: "Mutual" },
  { id: "likesYou", label: "Into you" },
  { id: "youLiked", label: "You're into" },
];

type Bucket = "reply" | "look" | "waiting" | "quiet";

const BUCKETS: { id: Bucket; title: string; hint: string }[] = [
  { id: "reply", title: "Reply", hint: "Waiting on you" },
  { id: "look", title: "Worth a look", hint: "Into you" },
  { id: "waiting", title: "Waiting on them", hint: "Ball's in their court" },
  { id: "quiet", title: "Gone quiet", hint: "Send a nudge?" },
];

/** How Muse sorts a chat: who needs you now, who's worth a look, and what can wait. */
function bucketOf(t: Thread): Bucket {
  if (t.status === "likesYou") return "look";
  if (t.status === "youLiked") return "waiting";
  const last = [...t.messages].reverse().find((m) => "from" in m);
  if (t.order <= 60) return "quiet";
  return last && "from" in last && last.from === "them" ? "reply" : "waiting";
}

/** What the list shows under a name. */
export function preview(m: Message | undefined, name: string): string {
  if (!m) return "";
  switch (m.kind) {
    case "text":
      return m.from === "me" ? `You: ${m.text}` : m.text;
    case "note":
      return m.text;
    case "media":
      return `${m.from === "me" ? "You sent" : `${name} sent`} ${m.media.length > 1 ? `${m.media.length} items` : m.media[0].kind === "video" ? "a video" : "a photo"}`;
    case "divider":
      return m.text;
    case "muse":
    case "museAsk":
    case "museVenues":
    case "museBooking":
      return "Planning a date…";
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
  mode,
  museUnread,
  museOffer,
  onSort,
  onUnsort,
}: {
  threads: Thread[];
  muse: Muse;
  museLast: string;
  onOpen: (tid: string) => void;
  onOpenMuse: () => void;
  /** Muse's sorted view of the inbox (driven by the app, so Muse's chat can start it too). */
  mode: "list" | "sorting" | "sorted";
  museUnread: boolean;
  /** Muse is offering to sort the inbox. */
  museOffer: boolean;
  onSort: () => void;
  onUnsort: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = (f: Filter) => (f === "all" ? threads.length : threads.filter((t) => t.status === f).length);
  const shown = filter === "all" ? threads : threads.filter((t) => t.status === filter);
  const needYou = threads.filter((t) => ["reply", "look"].includes(bucketOf(t))).length;

  const museRow = (
    <MuseRow
      muse={muse}
      text={mode === "sorted" ? `Sorted. ${needYou} chats need you.` : museOffer ? "Your inbox is getting busy. Want me to sort it?" : museLast}
      unread={museUnread}
      action={mode === "sorted" ? { label: "Show all", onPress: onUnsort } : museOffer ? { label: "Sort inbox", onPress: onSort } : undefined}
      thinking={mode === "sorting"}
      onOpen={onOpenMuse}
    />
  );

  return (
    <div className="absolute inset-0 bg-[#0B0A10]">
      <TopFade color="#0B0A10" />
      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto" style={{ paddingBottom: `calc(${TAB_BAR_SPACE} + 24px)` }}>
        <h1 className="px-5 pt-2 text-[34px] font-bold tracking-[-0.03em]">Chats</h1>

        <AnimatePresence mode="wait" initial={false}>
          {mode === "list" ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Filters */}
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4">
                {FILTERS.map((f) => {
                  const on = filter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFilter(f.id)}
                      className={`flex h-[40px] shrink-0 items-center gap-[6px] rounded-full px-4 text-[15px] font-medium transition-colors ${
                        on ? "bg-white text-black" : "bg-white/[0.08] text-white/80"
                      }`}
                    >
                      {f.id === "mutual" && <HeartIcon size={12} color={on ? "#FF3F6E" : "#FF8AA2"} />}
                      {f.label}
                      <span className={on ? "text-black/45" : "text-white/40"}>{count(f.id)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3">
                {filter === "all" && museRow}
                {shown.map((t) => (
                  <Row key={t.id} thread={t} onPress={() => onOpen(t.id)} />
                ))}
                {shown.length === 0 && <p className="px-8 py-12 text-center text-[15px] text-white/45">Nothing here yet.</p>}
              </div>
            </motion.div>
          ) : mode === "sorting" ? (
            <motion.div key="sorting" className="flex flex-col items-center pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MuseAvatar muse={muse} size={88} mood="thinking" />
              <p className="mt-5 text-[17px] font-medium text-white/70">Sorting {threads.length} chats…</p>
            </motion.div>
          ) : (
            <motion.div key="sorted" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mt-3">{museRow}</div>
              {BUCKETS.map((b, i) => {
                const items = threads.filter((t) => bucketOf(t) === b.id);
                if (!items.length) return null;
                return (
                  <motion.section key={b.id} className="mt-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center gap-2 px-5 pb-1">
                      <BucketIcon bucket={b.id} />
                      <h2 className="text-[17px] font-semibold">{b.title}</h2>
                      <span className="text-[15px] text-white/40">{items.length}</span>
                    </div>
                    {items.map((t) => (
                      <Row key={t.id} thread={t} hint={MUSE_HINTS[t.personId] ?? b.hint} onPress={() => onOpen(t.id)} />
                    ))}
                  </motion.section>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Muse's cell: her latest message, an unread dot, and an inline action when she's offering one. */
function MuseRow({
  muse,
  text,
  unread,
  action,
  thinking,
  onOpen,
}: {
  muse: Muse;
  text: string;
  unread: boolean;
  action?: { label: string; onPress: () => void };
  thinking: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="flex w-full items-start gap-3 px-4 py-[10px]">
      <button type="button" aria-label={`Open ${muse.name}`} onClick={onOpen} className="shrink-0">
        <MuseAvatar muse={muse} size={59} mood={thinking ? "thinking" : "idle"} />
      </button>
      <div className="min-w-0 flex-1 border-b border-white/[0.07] pb-[12px] pt-[2px]">
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <span className="flex items-center gap-2">
            <span className={`text-[17px] ${unread ? "font-bold" : "font-semibold"}`}>{muse.name}</span>
            {unread && <span className="ml-auto h-[10px] w-[10px] rounded-full bg-[#FF3F6E]" />}
          </span>
          <span className={`mt-[2px] block text-[15px] leading-[20px] ${unread ? "text-white/90" : "text-white/50"}`}>{text}</span>
        </button>
        {action && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={action.onPress}
            className="mt-2 flex h-[44px] items-center gap-2 rounded-full bg-white/10 px-4 text-[15px] font-semibold active:bg-white/20"
          >
            <SparkleIcon size={13} className="text-[#FF8AA2]" />
            {action.label}
          </motion.button>
        )}
      </div>
    </div>
  );
}

function BucketIcon({ bucket }: { bucket: Bucket }) {
  const style = {
    reply: "bg-[#FF3F6E] text-white",
    look: "bg-[#C94BD8] text-white",
    waiting: "bg-white/15 text-white/80",
    quiet: "bg-white/10 text-white/60",
  }[bucket];
  return (
    <span className={`flex h-[26px] w-[26px] items-center justify-center rounded-full ${style}`}>
      {bucket === "reply" ? <ChatBubbleIcon size={13} /> : bucket === "look" ? <HeartIcon size={12} color="#fff" /> : bucket === "waiting" ? <ClockIcon size={14} /> : <MoonIcon size={14} />}
    </span>
  );
}

function Row({ thread, hint, onPress }: { thread: Thread; hint?: string; onPress: () => void }) {
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
          <span className="ml-auto shrink-0 text-[13px] text-white/40">{thread.time}</span>
        </span>
        <span className="mt-[2px] flex items-center gap-2">
          <span className={`line-clamp-1 flex-1 text-[15px] leading-[20px] ${unread ? "text-white/90" : "text-white/50"}`}>
            {thread.typing ? <em className="not-italic text-[#FF8AA2]">typing…</em> : preview(last, p.name)}
          </span>
          {unread && <span className="h-[10px] w-[10px] shrink-0 rounded-full bg-[#FF3F6E]" />}
        </span>
        {hint && (
          <span className="mt-[3px] flex items-center gap-[5px] text-[13px] font-medium text-[#FF8AA2]">
            <SparkleIcon size={11} /> {hint}
          </span>
        )}
      </span>
    </motion.button>
  );
}
