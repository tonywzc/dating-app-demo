"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { PAST_INTROS, PEOPLE, type Person } from "@/lib/app-data";
import type { Muse } from "@/lib/mock-data";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { HeartIcon } from "@/components/photos/StoryScan";
import { Button, TextButton } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { ChevronRight, CloseIcon } from "@/components/ui/icons";
import { InterestSheet, type InterestDraft } from "./InterestSheet";
import { PassSheet } from "./PassSheet";
import { ProfileBook, type ChapterId } from "./ProfileBook";

export type TodayDecision = { kind: "interested"; note: string; viaMuse: boolean } | { kind: "passed"; reasons: string[] } | null;

const today = () => new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/** The matchmaker: one person a day, told as a short book. */
export function TodayTab({
  person,
  muse,
  decision,
  mutual,
  onInterested,
  onPass,
  onUndoPass,
  onOpenChat,
  onReadAgain,
  onOpenNearby,
  onOpenMuse,
}: {
  person: Person;
  muse: Muse;
  decision: TodayDecision;
  mutual: boolean;
  onInterested: (draft: InterestDraft) => void;
  onPass: (reasons: string[]) => void;
  onUndoPass: () => void;
  onOpenChat: () => void;
  onReadAgain: () => void;
  onOpenNearby: () => void;
  onOpenMuse: () => void;
}) {
  const [chapter, setChapter] = useState<ChapterId>("cover");
  const [sheet, setSheet] = useState<"interest" | "pass" | null>(null);
  const [opener, setOpener] = useState<string | null>(null);
  const applyOpener = useCallback((text: string) => {
    setOpener(text);
    setSheet("interest");
  }, []);

  return (
    <div className="absolute inset-0 bg-[#0A0810]">
      <AnimatePresence mode="wait" initial={false}>
        {decision ? (
          <motion.div key="after" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UntilTomorrow
              person={person}
              muse={muse}
              decision={decision}
              mutual={mutual}
              onOpenChat={onOpenChat}
              onReadAgain={onReadAgain}
              onUndoPass={onUndoPass}
              onOpenNearby={onOpenNearby}
              onOpenMuse={onOpenMuse}
            />
          </motion.div>
        ) : (
          <motion.div key="book" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}>
            <ProfileBook
              person={person}
              muse={muse}
              variant="today"
              bottomSpace={`calc(${TAB_BAR_SPACE} + 96px)`}
              onChapter={setChapter}
              onUseOpener={applyOpener}
              label={
                <span className="flex items-center gap-2 rounded-full bg-black/35 py-[5px] pl-[5px] pr-3 text-[13px] font-semibold backdrop-blur-md">
                  <MuseAvatar muse={muse} size={22} mood="idle" />
                  Today&apos;s introduction
                  <span className="font-normal text-white/60">&middot; {today()}</span>
                </span>
              }
            />

            {/* Decide */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[230px] bg-gradient-to-t from-[#0A0810] via-[#0A0810]/85 to-transparent" />
            <div className="absolute inset-x-0 z-20 flex items-center gap-3 px-5" style={{ bottom: `calc(${TAB_BAR_SPACE} + 14px)` }}>
              <motion.button
                type="button"
                aria-label={`Not for me`}
                onClick={() => setSheet("pass")}
                whileTap={{ scale: 0.92 }}
                className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#1C1A24]/80 text-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl"
              >
                <CloseIcon size={20} strokeWidth={2.6} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setSheet("interest")}
                whileTap={{ scale: 0.97 }}
                className="flex h-[58px] flex-1 items-center justify-center gap-2 rounded-full text-[17px] font-semibold"
                style={{
                  background: `linear-gradient(100deg, ${BRAND.colors.rose} 0%, ${BRAND.colors.overlap} 55%, ${BRAND.colors.violet} 100%)`,
                  boxShadow: "0 12px 34px -8px rgba(201,75,216,0.75)",
                }}
              >
                <HeartIcon size={18} color="#fff" />
                I&apos;d like to meet {person.name}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <InterestSheet
        open={sheet === "interest"}
        person={person}
        muse={muse}
        chapter={chapter}
        opener={opener}
        onClose={() => setSheet(null)}
        onSend={(draft) => {
          setSheet(null);
          setOpener(null);
          onInterested(draft);
        }}
      />
      <PassSheet
        open={sheet === "pass"}
        person={person}
        muse={muse}
        onClose={() => setSheet(null)}
        onPass={(reasons) => {
          setSheet(null);
          onPass(reasons);
        }}
      />
    </div>
  );
}

// ---------- After today's decision ----------

/** The next 9 AM, when the next introduction arrives. */
function nextIntro() {
  const target = new Date();
  target.setHours(9, 0, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  return target;
}

/** Time until the next introduction, as h:mm:ss. */
function timeLeft() {
  const target = nextIntro();
  const s = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function useCountdown() {
  const [left, setLeft] = useState(timeLeft);
  useEffect(() => {
    const t = setInterval(() => setLeft(timeLeft()), 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] as const },
});

function UntilTomorrow({
  person,
  muse,
  decision,
  mutual,
  onOpenChat,
  onReadAgain,
  onUndoPass,
  onOpenNearby,
  onOpenMuse,
}: {
  person: Person;
  muse: Muse;
  decision: NonNullable<TodayDecision>;
  mutual: boolean;
  onOpenChat: () => void;
  onReadAgain: () => void;
  onUndoPass: () => void;
  onOpenNearby: () => void;
  onOpenMuse: () => void;
}) {
  const left = useCountdown();
  const passed = decision.kind === "passed";
  const title = passed ? "Got it. Tomorrow will be sharper." : mutual ? "It's mutual!" : `Your note is on its way to ${person.name}`;
  const sub = passed
    ? "Thanks for telling me why. It helps me choose better for you."
    : mutual
      ? `${person.name} would love to meet you too. Say hi, or let me plan your first date.`
      : `I'll tell you the moment ${person.name} replies.`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{ background: "radial-gradient(80% 70% at 50% 0%, rgba(255,95,134,0.28), rgba(106,75,255,0.12) 55%, transparent)" }}
      />
      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto px-5" style={{ paddingBottom: `calc(${TAB_BAR_SPACE} + 24px)` }}>
        <div className="flex items-center justify-between pt-3">
          <h1 className="text-[34px] font-bold tracking-[-0.03em]">Today</h1>
        </div>

        <motion.div className="mt-6 flex flex-col items-center text-center" {...rise(0.05)}>
          <div className="relative">
            <MuseAvatar muse={muse} size={88} mood={mutual ? "speaking" : "idle"} />
            {!passed && (
              <motion.div
                className="absolute -bottom-2 -right-4 overflow-hidden rounded-full ring-4 ring-[#0A0810]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 }}
              >
                <Photo src={person.avatar} initial={person.name[0]} className="h-[46px] w-[46px]" />
              </motion.div>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h2 className="mt-6 text-[26px] font-bold leading-[32px] tracking-[-0.02em]">{title}</h2>
              <p className="mx-auto mt-2 max-w-[310px] text-[16px] leading-[23px] text-white/60">{sub}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div className="mt-6" {...rise(0.15)}>
          {mutual && !passed ? (
            <Button onClick={onOpenChat}>Say hi to {person.name}</Button>
          ) : passed ? (
            <div className="flex justify-center">
              <TextButton onClick={onUndoPass} className="text-white/75">
                Changed your mind? Take another look
              </TextButton>
            </div>
          ) : (
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.05] p-4">
              <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">
                {decision.kind === "interested" && decision.viaMuse ? `${muse.name} is introducing you` : "Your note"}
              </div>
              <p className="mt-2 text-[16px] leading-[22px] text-white/85">{decision.kind === "interested" ? decision.note : ""}</p>
              <div className="mt-2 text-[12px] text-white/40">Delivered</div>
            </div>
          )}
          {!passed && (
            <div className="mt-1 flex justify-center">
              <TextButton onClick={onReadAgain} className="text-white/70">
                Read {person.name}&apos;s story again
              </TextButton>
            </div>
          )}
        </motion.div>

        {/* Next introduction */}
        <motion.div className="mt-5 flex items-center gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.04] p-4" {...rise(0.25)}>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">Your next introduction</div>
            <div className="mt-1 text-[17px] font-semibold">{nextIntro().getDate() === new Date().getDate() ? "Today" : "Tomorrow"} at 9:00 AM</div>
          </div>
          <div className="rounded-[14px] bg-white/[0.07] px-3 py-2 text-[20px] font-semibold tabular-nums tracking-[0.02em]">{left}</div>
        </motion.div>
        <p className="mt-2 px-2 text-[12px] leading-[17px] text-white/40">
          One a day, on purpose. {muse.name} spends the night reading everyone nearby so tomorrow&apos;s person is worth your time.
        </p>

        {/* While you wait */}
        <motion.div className="mt-6" {...rise(0.35)}>
          <div className="px-1 text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">While you wait</div>
          <div className="mt-2 overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">
            <LinkRow title="See who's out tonight" sub="3 people near you are free tonight, plus 2 events" onPress={onOpenNearby} icon={<span className="text-[18px]">&#x1F4CD;</span>} />
            <LinkRow
              title={`Tell ${muse.name} what you thought`}
              sub="Every bit makes tomorrow's introduction better"
              onPress={onOpenMuse}
              icon={<MuseAvatar muse={muse} size={30} mood="idle" />}
            />
          </div>
        </motion.div>

        {/* Past introductions */}
        <motion.div className="mt-6" {...rise(0.45)}>
          <div className="px-1 text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">Past introductions</div>
          <div className="mt-2 overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">
            {PAST_INTROS.map((intro) => {
              const p = PEOPLE[intro.personId];
              return (
                <div key={p.id} className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3 last:border-b-0">
                  <Photo src={p.avatar} initial={p.name[0]} className="h-[40px] w-[40px] rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold">
                      {p.name}, {p.age}
                    </div>
                    <div className="text-[13px] text-white/50">{intro.day}</div>
                  </div>
                  <span className="rounded-full bg-white/[0.08] px-[10px] py-[4px] text-[12px] font-medium text-white/75">{intro.outcome}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LinkRow({ title, sub, icon, onPress }: { title: string; sub: string; icon: React.ReactNode; onPress: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      className="flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-3 text-left last:border-b-0"
    >
      <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-white/[0.07]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold">{title}</span>
        <span className="block text-[13px] text-white/50">{sub}</span>
      </span>
      <ChevronRight className="text-white/30" />
    </motion.button>
  );
}
