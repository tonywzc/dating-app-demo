"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { PAST_INTROS, PEOPLE, type Person } from "@/lib/app-data";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { HeartIcon } from "@/components/photos/StoryScan";
import { Photo } from "@/components/ui/Photo";
import { BookIcon, ChatBubbleIcon, CloseIcon, PeopleIcon, ReplayIcon, SlidersIcon } from "@/components/ui/icons";
import { DistanceSheet } from "./DistanceSheet";
import { PassSheet } from "./PassSheet";
import { ProfileBook } from "./ProfileBook";

export type TodayDecision = "interested" | "passed" | null;

/** The next 9 AM, when the next introduction arrives. */
function nextIntro() {
  const target = new Date();
  target.setHours(9, 0, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  return target;
}

function timeLeft() {
  const s = Math.max(0, Math.floor((nextIntro().getTime() - Date.now()) / 1000));
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

/** The matchmaker: one person a day (more with Plus), told as a short book. */
export function TodayTab({
  person,
  decision,
  mutual,
  plus,
  extrasLeft,
  onInterested,
  onPass,
  onUndoPass,
  onOpenChat,
  onReadAgain,
  onSeeAnother,
  distance,
  onDistance,
}: {
  distance: string;
  onDistance: (d: string) => void;
  person: Person;
  decision: TodayDecision;
  mutual: boolean;
  plus: boolean;
  extrasLeft: number;
  onInterested: () => void;
  onPass: (reason?: string) => void;
  onUndoPass: () => void;
  onOpenChat: () => void;
  onReadAgain: () => void;
  onSeeAnother: () => void;
}) {
  const [sheet, setSheet] = useState<"pass" | "distance" | null>(null);
  const filterButton = (
    <motion.button
      type="button"
      aria-label={`Distance: ${distance}`}
      whileTap={{ scale: 0.92 }}
      onClick={() => setSheet("distance")}
      className="flex h-[44px] items-center gap-2 rounded-full bg-black/40 px-4 text-[15px] font-semibold backdrop-blur-md"
    >
      <SlidersIcon size={18} />
      {distance}
    </motion.button>
  );

  return (
    <div className="absolute inset-0 bg-[#0A0810]">
      <AnimatePresence mode="wait" initial={false}>
        {decision ? (
          <motion.div key={`after-${person.id}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AfterDecision
              person={person}
              decision={decision}
              mutual={mutual}
              plus={plus}
              extrasLeft={extrasLeft}
              onOpenChat={onOpenChat}
              onReadAgain={onReadAgain}
              onUndoPass={onUndoPass}
              onSeeAnother={onSeeAnother}
              filterButton={filterButton}
            />
          </motion.div>
        ) : (
          <motion.div key={`book-${person.id}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}>
            <ProfileBook
              person={person}
              variant="today"
              bottomSpace={`calc(${TAB_BAR_SPACE} + 110px)`}
              label={<span className="rounded-full bg-black/40 px-4 py-[10px] text-[15px] font-semibold backdrop-blur-md">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
              topRight={filterButton}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[230px] bg-gradient-to-t from-[#0A0810] via-[#0A0810]/85 to-transparent" />
            <div className="absolute inset-x-0 z-20 flex items-center gap-3 px-5" style={{ bottom: `calc(${TAB_BAR_SPACE} + 14px)` }}>
              <motion.button
                type="button"
                aria-label="Pass"
                onClick={() => setSheet("pass")}
                whileTap={{ scale: 0.92 }}
                className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#1C1A24]/80 text-white/85 backdrop-blur-xl"
              >
                <CloseIcon size={22} strokeWidth={2.6} />
              </motion.button>
              <motion.button
                type="button"
                onClick={onInterested}
                whileTap={{ scale: 0.97 }}
                className="flex h-[60px] flex-1 items-center justify-center gap-2 rounded-full text-[17px] font-semibold"
                style={{
                  background: `linear-gradient(100deg, ${BRAND.colors.rose} 0%, ${BRAND.colors.overlap} 55%, ${BRAND.colors.violet} 100%)`,
                  boxShadow: "0 12px 34px -8px rgba(201,75,216,0.75)",
                }}
              >
                <ChatBubbleIcon size={18} />
                Start a conversation with {person.name}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PassSheet
        open={sheet === "pass"}
        person={person}
        onClose={() => setSheet(null)}
        onPass={(reason) => {
          setSheet(null);
          onPass(reason);
        }}
      />
      <DistanceSheet open={sheet === "distance"} value={distance} onChange={onDistance} onClose={() => setSheet(null)} />
    </div>
  );
}

function AfterDecision({
  person,
  decision,
  mutual,
  plus,
  extrasLeft,
  onOpenChat,
  onReadAgain,
  onUndoPass,
  onSeeAnother,
  filterButton,
}: {
  filterButton: React.ReactNode;
  person: Person;
  decision: NonNullable<TodayDecision>;
  mutual: boolean;
  plus: boolean;
  extrasLeft: number;
  onOpenChat: () => void;
  onReadAgain: () => void;
  onUndoPass: () => void;
  onSeeAnother: () => void;
}) {
  const left = useCountdown();
  const passed = decision === "passed";
  const title = passed ? "Passed" : mutual ? "It's mutual" : `Waiting for ${person.name}`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{ background: "radial-gradient(80% 70% at 50% 0%, rgba(255,95,134,0.24), rgba(106,75,255,0.1) 55%, transparent)" }}
      />
      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto px-5" style={{ paddingBottom: `calc(${TAB_BAR_SPACE} + 24px)` }}>
        <div className="flex items-center justify-between pt-3">
          <h1 className="text-[32px] font-bold tracking-[-0.03em]">Introductions</h1>
          {filterButton}
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <motion.div className="relative" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <Photo src={person.avatar} initial={person.name[0]} className={`h-[112px] w-[112px] rounded-full ${passed ? "opacity-50 grayscale" : ""}`} />
            {mutual && !passed && (
              <span className="absolute -bottom-1 -right-1 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#FF3F6E] ring-4 ring-[#0A0810]">
                <HeartIcon size={18} color="#fff" />
              </span>
            )}
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.h2 key={title} className="mt-5 text-[28px] font-bold tracking-[-0.02em]" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {title}
            </motion.h2>
          </AnimatePresence>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {passed ? (
            <Action icon={<ReplayIcon size={20} />} label="Undo" onPress={onUndoPass} />
          ) : (
            <Action icon={<ChatBubbleIcon size={18} />} label={mutual ? "Message" : "Chat"} onPress={onOpenChat} highlight={mutual} />
          )}
          <Action icon={<BookIcon size={20} />} label="Story" onPress={onReadAgain} />
        </div>

        {/* Next introduction, or see another now */}
        <div className="mt-6 flex items-center gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.04] py-2 pl-5 pr-2">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-white/50">Next in</div>
            <div className="text-[19px] font-semibold tabular-nums">{left}</div>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onSeeAnother}
            className="flex h-[52px] items-center gap-2 rounded-full bg-white/10 pl-4 pr-3 text-[16px] font-semibold"
          >
            <PeopleIcon size={19} />
            See another
            <span className="rounded-full px-2 py-[2px] text-[11px] font-bold" style={{ background: `linear-gradient(100deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}>
              {plus ? extrasLeft : "PLUS"}
            </span>
          </motion.button>
        </div>

        {/* Past introductions */}
        <div className="mt-8 px-1 text-[13px] font-medium uppercase tracking-[0.06em] text-white/45">Earlier this week</div>
        <div className="mt-3 flex gap-5 px-1">
          {PAST_INTROS.map((intro) => {
            const p = PEOPLE[intro.personId];
            return (
              <div key={p.id} className="flex w-[72px] flex-col items-center text-center">
                <span className="relative">
                  <Photo src={p.avatar} initial={p.name[0]} className="h-[64px] w-[64px] rounded-full" />
                  <span
                    className={`absolute -bottom-[2px] -right-[2px] flex h-[24px] w-[24px] items-center justify-center rounded-full ring-[3px] ring-[#0A0810] ${
                      intro.outcome === "Mutual" ? "bg-[#34C759] text-white" : "bg-[#FF3F6E]"
                    }`}
                  >
                    {intro.outcome === "Mutual" ? <ChatBubbleIcon size={12} /> : <HeartIcon size={12} color="#fff" />}
                  </span>
                </span>
                <span className="mt-2 text-[15px] font-semibold">{p.name}</span>
                <span className={`text-[12px] font-medium ${intro.outcome === "Mutual" ? "text-[#5BE07F]" : "text-[#FF8AA2]"}`}>{intro.outcome}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Action({ icon, label, onPress, highlight = false }: { icon: React.ReactNode; label: string; onPress: () => void; highlight?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ scale: 0.96 }}
      className={`flex h-[56px] items-center justify-center gap-2 rounded-full text-[17px] font-semibold ${highlight ? "text-white" : "bg-white/10"}`}
      style={highlight ? { background: `linear-gradient(100deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` } : undefined}
    >
      {icon}
      {label}
    </motion.button>
  );
}
