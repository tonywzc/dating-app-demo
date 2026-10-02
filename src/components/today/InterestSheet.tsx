"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Person } from "@/lib/app-data";
import type { Muse } from "@/lib/mock-data";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Sheet } from "@/components/ui/Sheet";
import { SparkleIcon } from "@/components/ui/icons";
import type { ChapterId } from "./ProfileBook";

export type InterestDraft = { note: string; about?: string; viaMuse: boolean };

const short = (text: string, max = 34) => (text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text);

/** Parts of a profile you can reply to, and which one fits the chapter you were reading. */
function replyTargets(p: Person) {
  return [
    ...p.moments.map((m) => ({ id: `m-${m.id}`, label: m.caption ?? "A moment", chapter: "world" as ChapterId })),
    ...p.quotes.map((q, i) => ({ id: `q-${i}`, label: `“${short(q.a)}”`, chapter: "words" as ChapterId })),
    ...(p.roots.story ? [{ id: "roots", label: `What shaped ${p.name}`, chapter: "shaped" as ChapterId }] : []),
  ];
}

/**
 * "I'd like to meet" never goes out empty: it carries a note, and can point at
 * the part of their story that made you say yes. Muse drafts the note.
 */
export function InterestSheet({
  open,
  person,
  muse,
  chapter,
  opener,
  onSend,
  onClose,
}: {
  open: boolean;
  person: Person;
  muse: Muse;
  chapter: ChapterId;
  opener: string | null;
  onSend: (draft: InterestDraft) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} size="large">
      {open && <Body person={person} muse={muse} chapter={chapter} opener={opener} onSend={onSend} />}
    </Sheet>
  );
}

function Body({ person, muse, chapter, opener, onSend }: { person: Person; muse: Muse; chapter: ChapterId; opener: string | null; onSend: (d: InterestDraft) => void }) {
  // What they were just reading comes first.
  const all = replyTargets(person);
  const targets = [...all.filter((t) => t.chapter === chapter), ...all.filter((t) => t.chapter !== chapter)];
  const [about, setAbout] = useState(() => targets.find((t) => t.chapter === chapter)?.id ?? null);
  const [note, setNote] = useState(opener ?? person.opener);
  const [viaMuse, setViaMuse] = useState(false);
  const edited = note !== (opener ?? person.opener);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar -mx-5 min-h-0 flex-1 overflow-y-auto px-5">
        <div className="flex items-center gap-3 pt-1">
          <Photo src={person.avatar} initial={person.name[0]} className="h-[44px] w-[44px] rounded-full" />
          <div>
            <h2 className="text-[20px] font-bold leading-[24px] tracking-[-0.02em]">Let {person.name} know</h2>
            <p className="text-[14px] text-white/55">{person.name} sees your note with your profile.</p>
          </div>
        </div>

        {targets.length > 0 && (
          <>
            <div className="mt-5 text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">Reply to something (optional)</div>
            <div className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1">
              {targets.map((t) => {
                const on = about === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAbout(on ? null : t.id)}
                    className={`shrink-0 rounded-full border px-3 py-[7px] text-[14px] transition-colors ${
                      on ? "border-transparent bg-white text-black" : "border-white/15 bg-white/[0.05] text-white/80"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-5 flex items-center gap-[6px] text-[12px] font-medium text-white/55">
          <SparkleIcon size={12} className="text-[#FF8AA2]" />
          {edited ? "Your note" : `${muse.name} drafted this. Make it yours.`}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={240}
          aria-label="Your note"
          className="mt-2 w-full resize-none rounded-[18px] border border-white/15 bg-white/[0.06] px-4 py-3 text-[16px] leading-[22px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
        />

        <div className="mt-4 space-y-2">
          <Option
            selected={!viaMuse}
            onPress={() => setViaMuse(false)}
            title="Send my note"
            sub="Free. Your one introduction today."
          />
          <Option
            selected={viaMuse}
            onPress={() => setViaMuse(true)}
            title={
              <span className="flex items-center gap-2">
                {muse.name} introduces you
                <span className="rounded-full px-2 py-[1px] text-[11px] font-bold" style={{ background: `linear-gradient(100deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}>
                  PLUS
                </span>
              </span>
            }
            sub={`${muse.name} tells ${person.name} why you two fit, and you're first in ${person.name}'s day. First one's on us.`}
            icon={<MuseAvatar muse={muse} size={26} mood="idle" />}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button disabled={!note.trim()} onClick={() => onSend({ note: note.trim(), about: targets.find((t) => t.id === about)?.label, viaMuse })}>
          {viaMuse ? `Send with ${muse.name}` : "Send"}
        </Button>
      </div>
    </div>
  );
}

function Option({ selected, onPress, title, sub, icon }: { selected: boolean; onPress: () => void; title: React.ReactNode; sub: string; icon?: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ scale: 0.98 }}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-[18px] border p-4 text-left transition-colors ${selected ? "border-white/60 bg-white/[0.08]" : "border-white/10 bg-white/[0.03]"}`}
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold">{title}</span>
        <span className="mt-[2px] block text-[13px] leading-[18px] text-white/55">{sub}</span>
      </span>
      <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${selected ? "border-white bg-white" : "border-white/30"}`}>
        {selected && <span className="h-[8px] w-[8px] rounded-full bg-[#0B0A10]" />}
      </span>
    </motion.button>
  );
}
