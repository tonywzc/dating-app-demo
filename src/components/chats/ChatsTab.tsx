"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MUSE_HINTS, PEOPLE, type Interest, type Message, type Thread } from "@/lib/app-data";
import { ChatBubbleIcon, CheckIcon, ChevronDownIcon, ClockIcon, CloseIcon, MoonIcon, SparkleIcon } from "@/components/ui/icons";
import type { Muse } from "@/lib/mock-data";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { HeartIcon } from "@/components/photos/StoryScan";
import { TopFade } from "@/components/ui/TopFade";
import { Photo } from "@/components/ui/Photo";

type Who = "all" | Interest;
type Reply = "any" | "respond" | "waiting";

const WHO: { id: Who; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "mutual", label: "Mutual" },
  { id: "likesYou", label: "Into you" },
  { id: "youLiked", label: "You're into" },
];

const REPLY: { id: Reply; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "respond", label: "Need to respond" },
  { id: "waiting", label: "Waiting for reply" },
];

/** Whose turn it is: the last message is theirs (you need to respond) or yours (you're waiting). */
function turnOf(t: Thread): Exclude<Reply, "any"> {
  if (t.status === "youLiked") return "waiting";
  const last = [...t.messages].reverse().find((m) => "from" in m);
  return last && "from" in last && last.from === "me" ? "waiting" : "respond";
}

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
  const [who, setWho] = useState<Who>("all");
  const [reply, setReply] = useState<Reply>("any");
  const [menu, setMenu] = useState<"who" | "reply" | null>(null);
  const matchWho = (t: Thread, w: Who) => w === "all" || t.status === w;
  const matchReply = (t: Thread, r: Reply) => r === "any" || turnOf(t) === r;
  const shown = threads.filter((t) => matchWho(t, who) && matchReply(t, reply));
  const filtered = who !== "all" || reply !== "any";
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
              {/* Filters: two dropdowns */}
              <div className="relative mt-4 flex gap-2 px-4">
                {menu && <div className="fixed inset-0 z-20" onClick={() => setMenu(null)} />}
                <div className="relative z-30">
                  <FilterChip
                    label={who === "all" ? "Everyone" : WHO.find((w) => w.id === who)!.label}
                    icon={<HeartIcon size={12} color={who === "all" ? "#FF8AA2" : "#FF3F6E"} />}
                    active={who !== "all"}
                    open={menu === "who"}
                    onPress={() => setMenu(menu === "who" ? null : "who")}
                  />
                  <Menu
                    open={menu === "who"}
                    options={WHO.map((o) => ({ ...o, n: threads.filter((t) => matchWho(t, o.id) && matchReply(t, reply)).length }))}
                    selected={who}
                    onSelect={(id) => {
                      setWho(id as Who);
                      setMenu(null);
                    }}
                  />
                </div>
                <div className="relative z-30">
                  <FilterChip
                    label={reply === "any" ? "Replies" : REPLY.find((r) => r.id === reply)!.label}
                    icon={<ChatBubbleIcon size={12} />}
                    active={reply !== "any"}
                    open={menu === "reply"}
                    onPress={() => setMenu(menu === "reply" ? null : "reply")}
                  />
                  <Menu
                    open={menu === "reply"}
                    options={REPLY.map((o) => ({ ...o, n: threads.filter((t) => matchWho(t, who) && matchReply(t, o.id)).length }))}
                    selected={reply}
                    onSelect={(id) => {
                      setReply(id as Reply);
                      setMenu(null);
                    }}
                  />
                </div>
                {filtered && (
                  <button
                    type="button"
                    aria-label="Clear filters"
                    onClick={() => {
                      setWho("all");
                      setReply("any");
                    }}
                    className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/[0.08] text-white/70"
                  >
                    <CloseIcon size={12} />
                  </button>
                )}

              </div>

              <div className="mt-3">
                {!filtered && museRow}
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

function Menu({ open, options, selected, onSelect }: { open: boolean; options: { id: string; label: string; n: number }[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute left-0 top-[52px] w-[240px] overflow-hidden rounded-[20px] border border-white/10 bg-[#24222C]/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          style={{ transformOrigin: "top left" }}
          initial={{ opacity: 0, scale: 0.9, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        >
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              className="flex h-[52px] w-full items-center gap-3 border-b border-white/[0.07] px-4 text-left text-[16px] last:border-b-0 active:bg-white/10"
            >
              <span className="w-[16px]">{selected === o.id && <CheckIcon size={14} className="text-[#FF8AA2]" />}</span>
              <span className="flex-1">{o.label}</span>
              <span className="text-[14px] text-white/40">{o.n}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FilterChip({ label, icon, active, open, onPress }: { label: string; icon: React.ReactNode; active: boolean; open: boolean; onPress: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onPress}
      className={`flex h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-medium transition-colors ${active ? "bg-white text-black" : "bg-white/[0.08] text-white/85"}`}
    >
      {icon}
      {label}
      <motion.span animate={{ rotate: open ? 180 : 0 }} className={active ? "text-black/50" : "text-white/50"}>
        <ChevronDownIcon size={14} />
      </motion.span>
    </button>
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
