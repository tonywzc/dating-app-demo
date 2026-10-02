"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { BEATS, fill, type Answers, type Summary } from "@/lib/muse-script";
import type { Person } from "@/lib/app-data";
import type { Muse } from "@/lib/mock-data";
import { BackButton } from "@/components/app/PushScreen";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { Photo } from "@/components/ui/Photo";
import { ChevronRight, MicIcon, SendIcon } from "@/components/ui/icons";
import { MuseBubble } from "./PlanMessages";
import type { MuseLine } from "./useChats";

const prompts = (name: string) => [`Why ${name}?`, "Help me write an opener", "What's on tonight?", "How do you plan a date?"];

/** Your chat with Muse: what Muse knows about you up top, and everything you've said to each other below. */
export function MuseChat({
  muse,
  myName,
  summary,
  answers,
  pick,
  log,
  typing,
  onSend,
  onBack,
  onTalk,
  onOpenToday,
}: {
  muse: Muse;
  myName: string;
  summary: Summary;
  answers: Answers;
  pick: Person;
  log: MuseLine[];
  typing: boolean;
  onSend: (text: string) => void;
  onBack: () => void;
  onTalk: () => void;
  onOpenToday: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  // The onboarding conversation, as history.
  const history = useMemo(
    () =>
      BEATS.flatMap((beat) =>
        beat.id in answers
          ? [
              ...beat.muse.map((line, i) => ({ id: `${beat.id}-m${i}`, from: "muse" as const, text: fill(line, myName) })),
              { id: `${beat.id}-u`, from: "me" as const, text: answers[beat.id] },
            ]
          : [],
      ),
    [answers, myName],
  );

  useEffect(() => {
    const el = scroller.current;
    if (el && log.length) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [log.length, typing]);

  // Start at the latest message.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const send = (value: string) => {
    if (!value.trim()) return;
    onSend(value.trim());
    setText("");
    setOpen(false);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A0810]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px]" style={{ background: "radial-gradient(80% 70% at 50% 0%, rgba(255,95,134,0.2), rgba(106,75,255,0.1) 55%, transparent)" }} />

      {/* Header */}
      <div className="pt-safe relative z-10">
        <div className="flex items-center gap-3 px-3 pb-2">
          <BackButton onPress={onBack} />
          <MuseAvatar muse={muse} size={38} mood={typing ? "thinking" : "idle"} />
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-semibold leading-[20px]">{muse.name}</div>
            <div className="text-[12px] text-white/50">{typing ? "Thinking…" : "Your matchmaker"}</div>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={onTalk}
            className="flex h-[36px] items-center gap-[6px] rounded-full bg-white/10 px-3 text-[14px] font-semibold"
          >
            <MicIcon size={15} /> Talk
          </motion.button>
        </div>

        {/* Who you are */}
        <div className="px-3 pb-2">
          <motion.div
            layout
            className="overflow-hidden rounded-[22px] p-[1px]"
            style={{ background: `linear-gradient(160deg, ${BRAND.colors.roseTop}77, rgba(255,255,255,0.06) 45%, ${BRAND.colors.violet}77)` }}
          >
            <motion.div layout className="rounded-[21px] bg-[#15121C]">
              <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.07em] text-white/50">Who you are, to {muse.name}</span>
                  <span className={`mt-1 block text-[15px] leading-[21px] text-white/90 ${open ? "" : "line-clamp-2"}`}>{summary.essence}</span>
                </span>
                <motion.span animate={{ rotate: open ? 90 : 0 }} className="mt-[22px] text-white/45">
                  <ChevronRight size={14} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="no-scrollbar max-h-[330px] space-y-4 overflow-y-auto px-4 pb-4">
                      {summary.sections.map((s) => (
                        <div key={s.title}>
                          <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">{s.title}</div>
                          <div className="mt-2 flex flex-wrap gap-[6px]">
                            {s.items.map((item) => (
                              <span key={item} className="rounded-full bg-white/[0.08] px-3 py-[5px] text-[13px] text-white/85">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      <p className="text-[13px] leading-[18px] text-white/50">
                        About {summary.fitPeople.toLocaleString()} people nearby could be a great fit. Only you can see this.
                      </p>
                      <button type="button" onClick={onTalk} className="flex items-center gap-1 text-[14px] font-semibold text-[#FF8AA2]">
                        Something&apos;s off? Tell {muse.name} <ChevronRight size={11} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Conversation */}
      <div ref={scroller} className="no-scrollbar relative flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-2">
        <div className="py-1 text-center text-[12px] font-medium text-white/40">Yesterday · Getting to know you</div>
        {history.map((l) => (
          <Line key={l.id} line={l} muse={muse} />
        ))}

        <div className="py-1 text-center text-[12px] font-medium text-white/40">Today · 9:00 AM</div>
        <MuseBubble muse={muse}>Good morning, {myName}. I spent the night reading everyone nearby. Today I&apos;d like you to meet {pick.name}.</MuseBubble>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onOpenToday}
          className="ml-9 flex w-[calc(100%-60px)] items-center gap-3 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.05] p-2 pr-3 text-left"
        >
          <Photo src={pick.avatar} initial={pick.name[0]} className="h-[56px] w-[56px] rounded-[14px]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold">
              {pick.name}, {pick.age}
            </span>
            <span className="block truncate text-[13px] text-white/55">{pick.overlaps.slice(0, 2).join(" · ")}</span>
          </span>
          <span className="text-[13px] font-semibold text-[#FF8AA2]">Read</span>
        </motion.button>

        {log.map((l) => (
          <Line key={l.id} line={l} muse={muse} />
        ))}
        <AnimatePresence>
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <MuseAvatar muse={muse} size={28} mood="thinking" />
              <span className="text-[14px] text-white/45">{muse.name} is thinking…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="pb-safe relative border-t border-white/[0.06] bg-[#0A0810] pt-2">
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto px-3">
          {prompts(pick.name).map((p) => (
            <button key={p} type="button" onClick={() => send(p)} className="shrink-0 rounded-full border border-white/12 bg-white/[0.05] px-3 py-[6px] text-[14px] text-white/80 active:bg-white/10">
              {p}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2 px-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${muse.name}`}
            aria-label={`Message ${muse.name}`}
            className="h-[42px] min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.05] px-4 text-[16px] text-white outline-none placeholder:text-white/35 focus:border-white/35"
          />
          {text.trim() ? (
            <button type="submit" aria-label="Send" className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#FF3F6E]">
              <SendIcon size={18} />
            </button>
          ) : (
            <button
              type="button"
              aria-label={`Talk to ${muse.name}`}
              onClick={onTalk}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full"
              style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
            >
              <MicIcon size={19} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function Line({ line, muse }: { line: { from: "muse" | "me"; text: string }; muse: Muse }) {
  if (line.from === "muse") return <MuseBubble muse={muse}>{line.text}</MuseBubble>;
  return (
    <div className="flex justify-end pl-12">
      <span className="rounded-[20px] rounded-br-[6px] bg-white/[0.12] px-4 py-[9px] text-[16px] leading-[22px]">{line.text}</span>
    </div>
  );
}
