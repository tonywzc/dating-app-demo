"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Booking, Message, Venue } from "@/lib/app-data";
import type { Muse } from "@/lib/mock-data";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { Photo } from "@/components/ui/Photo";
import { Spinner } from "@/components/ui/Spinner";
import { CalendarIcon, CheckIcon, PinIcon } from "@/components/ui/icons";

// Muse's side of "Plan a date": questions for both of you, venue picks, booking, and the ticket.

/** Muse's speech in a chat: her orb, and a bubble with a gradient edge. */
export function MuseBubble({ muse, children, wide = false }: { muse: Muse; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex items-end gap-2 pr-6">
      <MuseAvatar muse={muse} size={28} mood="idle" />
      <div
        className={`rounded-[22px] rounded-bl-[8px] p-[1px] ${wide ? "flex-1" : "max-w-[86%]"}`}
        style={{ background: `linear-gradient(140deg, ${BRAND.colors.roseTop}aa, ${BRAND.colors.violet}aa)` }}
      >
        <div className="rounded-[21px] rounded-bl-[7px] bg-[#1A1622] px-4 py-[10px] text-[16px] leading-[22px]">{children}</div>
      </div>
    </div>
  );
}

export function MuseAsk({
  muse,
  msg,
  myName,
  them,
  onAnswer,
}: {
  muse: Muse;
  msg: Extract<Message, { kind: "museAsk" }>;
  myName: string;
  them: string;
  onAnswer: (answers: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const answered = Boolean(msg.mine);
  const toggle = (o: string) => {
    if (!msg.multi) return onAnswer([o]);
    setPicked((list) => (list.includes(o) ? list.filter((x) => x !== o) : [...list, o]));
  };

  return (
    <div>
      <MuseBubble muse={muse}>{msg.question}</MuseBubble>
      {!answered ? (
        <motion.div className="ml-9 mt-2 flex flex-wrap gap-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {msg.options.map((o) => {
            const on = picked.includes(o);
            return (
              <motion.button
                key={o}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(o)}
                aria-pressed={on}
                className={`rounded-full border px-[14px] py-[8px] text-[15px] font-medium transition-colors ${on ? "border-transparent bg-white text-black" : "border-white/20 bg-white/[0.06]"}`}
              >
                {o}
              </motion.button>
            );
          })}
          {msg.multi && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              disabled={!picked.length}
              onClick={() => onAnswer(picked)}
              className="rounded-full px-[16px] py-[8px] text-[15px] font-semibold text-white transition-opacity disabled:opacity-35"
              style={{ background: `linear-gradient(100deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
            >
              Done
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div className="ml-9 mt-2 space-y-[6px]">
          <Answer who={myName} text={msg.mine!.join(", ")} mine />
          <Answer who={them} text={msg.theirs} />
        </div>
      )}
    </div>
  );
}

function Answer({ who, text, mine = false }: { who: string; text?: string; mine?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[14px]">
      <span className={`w-[58px] shrink-0 truncate font-semibold ${mine ? "text-[#FF8AA2]" : "text-[#A98BFF]"}`}>{who}</span>
      {text ? (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-full bg-white/[0.08] px-3 py-[4px] text-white/85">
          {text}
        </motion.span>
      ) : (
        <span className="flex items-center gap-2 text-white/45">
          <Spinner size={14} color="rgba(255,255,255,0.6)" /> Waiting…
        </span>
      )}
    </div>
  );
}

export function MuseVenues({ venues, picked, them, onPick }: { venues: Venue[]; picked?: string; them: string; onPick: (v: Venue) => void }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-pl-[52px] gap-[10px] overflow-x-auto pl-[52px] pr-4">
      {venues.map((v, i) => {
        const mine = picked === v.id;
        return (
          <motion.div
            key={v.id}
            className={`w-[232px] shrink-0 snap-start overflow-hidden rounded-[22px] border bg-[#1A1622] transition-opacity ${mine ? "border-white/70" : "border-white/10"} ${picked && !mine ? "opacity-45" : ""}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: picked && !mine ? 0.45 : 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="relative h-[118px]">
              <Photo src={v.photo} className="absolute inset-0 h-full w-full" />
              <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-[2px] text-[12px] font-semibold backdrop-blur">{v.price}</span>
            </div>
            <div className="p-3">
              <div className="text-[16px] font-semibold leading-[20px]">{v.name}</div>
              <div className="mt-[2px] flex items-center gap-1 text-[12px] text-white/50">
                <PinIcon size={12} /> {v.area}
              </div>
              <p className="mt-2 text-[13px] leading-[18px] text-white/75">{v.why}</p>
              {mine ? (
                <div className="mt-3 flex h-[44px] items-center justify-center gap-1 rounded-full bg-white text-[14px] font-semibold text-black">
                  <CheckIcon size={12} /> Your pick
                </div>
              ) : (
                <button
                  type="button"
                  disabled={Boolean(picked)}
                  onClick={() => onPick(v)}
                  className="mt-3 h-[44px] w-full rounded-full bg-white/10 text-[14px] font-semibold active:bg-white/20 disabled:active:bg-white/10"
                >
                  Pick this
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
      <div className="w-1 shrink-0" aria-hidden />
      <span className="sr-only">{them} is choosing too</span>
    </div>
  );
}

const BOOKING_STEPS = (venue: Venue) => ["Checking tables for two", `Holding a table at ${venue.name}`, "Confirming your booking"];

export function MuseBooking({ muse, venue, done }: { muse: Muse; venue: Venue; done: boolean }) {
  const steps = BOOKING_STEPS(venue);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1100);
    return () => clearInterval(t);
  }, [done, steps.length]);
  const current = done ? steps.length : step;

  return (
    <MuseBubble muse={muse} wide>
      <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-white/55">
        <MuseAvatar muse={muse} size={16} mood={done ? "idle" : "thinking"} />
        {done ? "Booked" : `${muse.name} is booking`}
      </div>
      <div className="mt-2 space-y-2">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 text-[15px] transition-opacity ${i <= current ? "opacity-100" : "opacity-35"}`}>
            <span className="flex h-[20px] w-[20px] items-center justify-center">
              {i < current ? (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#34C759] text-white">
                  <CheckIcon size={10} />
                </span>
              ) : i === current ? (
                <Spinner size={16} />
              ) : (
                <span className="h-[8px] w-[8px] rounded-full bg-white/30" />
              )}
            </span>
            {s}
          </div>
        ))}
      </div>
    </MuseBubble>
  );
}

/** The booking, as a ticket. */
export function DateTicket({ booking, them }: { booking: Booking; them: string }) {
  const [calendarName, calendarDetail] = booking.calendar.split(" · ");
  return (
    <motion.div
      className="ml-9 mr-6 overflow-hidden rounded-[24px] bg-[#F6F3FA] text-[#0B0A10] shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="relative h-[110px]">
        <Photo src={booking.venue.photo} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-4 right-4 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/80">Your first date</div>
          <div className="text-[20px] font-bold leading-[24px]">{booking.venue.name}</div>
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <div className="grid grid-cols-2 gap-y-2 text-[13px]">
          <Field label="When" value={booking.when} />
          <Field label="Where" value={booking.venue.area} />
          <Field label="Table" value={`For 2 · you & ${them}`} />
          <Field label="Confirmation" value={booking.code} />
        </div>
        {/* Perforation */}
        <div className="relative -mx-4 my-3 border-t-2 border-dashed border-black/10">
          <span className="absolute -left-[9px] -top-[9px] h-[16px] w-[16px] rounded-full bg-[#0B0A10]" />
          <span className="absolute -right-[9px] -top-[9px] h-[16px] w-[16px] rounded-full bg-[#0B0A10]" />
        </div>
        <div className="flex items-center gap-2 text-[14px] font-semibold">
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#34C759] text-white">
            <CheckIcon size={12} />
          </span>
          <span className="leading-[17px]">
            Added to {calendarName}
            <span className="block text-[12px] font-normal text-black/45">{calendarDetail} calendar</span>
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="flex h-[44px] items-center justify-center gap-[6px] rounded-full bg-black/[0.06] text-[14px] font-semibold active:bg-black/10">
            <PinIcon size={14} /> Directions
          </button>
          <button type="button" className="flex h-[44px] items-center justify-center gap-[6px] rounded-full bg-black/[0.06] text-[14px] font-semibold active:bg-black/10">
            <CalendarIcon size={14} /> Open calendar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-black/40">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
