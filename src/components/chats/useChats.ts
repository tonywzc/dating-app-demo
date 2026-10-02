"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BUDGET_OPTIONS,
  CALENDARS,
  PEOPLE,
  REPLIES,
  SEED_THREADS,
  THEIR_WHEN,
  VENUES,
  WHAT_OPTIONS,
  WHEN_OPTIONS,
  msgId,
  type Interest,
  type Message,
  type Origin,
  type Thread,
  type Venue,
} from "@/lib/app-data";
import type { Media } from "@/lib/mock-data";

export const threadIdFor = (personId: string) => `t-${personId}`;

/** A heads-up banner that drops from the top of the screen. */
export type Banner = { id: string; title: string; body: string; avatar?: string; muse?: boolean; onOpen?: () => void };

export type MuseLine = { id: string; from: "muse" | "me"; text: string; card?: "today" | "date" };

// Pacing (ms) for the other side of the conversation.
const TYPING_DELAY = 900;
const REPLY_DELAY = 2300;
const ANSWER_DELAY = 1500;
const BOOKING_MS = 3600;
/** Today's introduction "replies" this long after you say you'd like to meet. */
export const MUTUAL_DELAY = 7000;

const SLOT: Record<string, { day: number; time: string }> = {
  "Thu evening": { day: 4, time: "7:30 PM" },
  "Fri evening": { day: 5, time: "7:30 PM" },
  "Sat daytime": { day: 6, time: "1:00 PM" },
  "Sun brunch": { day: 0, time: "11:00 AM" },
};

/** "Fri, Oct 3 · 7:30 PM" for the next such slot after today. */
export function slotLabel(slot: string) {
  const { day, time } = SLOT[slot] ?? SLOT["Fri evening"];
  const date = new Date();
  date.setDate(date.getDate() + (((day - date.getDay() + 7) % 7) || 7));
  return `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${time}`;
}

const dayName = (slot: string) => slotLabel(slot).split(",")[0];

const personOf = (tid: string) => PEOPLE[tid.replace(/^t-/, "")];

type Plan = { when?: string; what?: string; budget?: string; venue?: Venue };

/** Muse's answer in your chat with Muse (scripted by keyword). */
function museReply(text: string) {
  const t = text.toLowerCase();
  if (/why|maya|today/.test(t))
    return "You share a lot: big family dinners, cooking for friends, weekend hikes. And you both want something serious.";
  if (/open|say|first message|write/.test(t))
    return "Ask about something in her story, like her first pot on the wheel.";
  if (/date|plan|book/.test(t))
    return "Tap the calendar in any mutual chat. I'll ask you both, then book it.";
  if (/nearby|tonight|event/.test(t))
    return "Natural wine night in Hayes Valley, 7 PM. Check Nearby.";
  return "Got it. I'll keep that in mind.";
}

export function useChats({
  myName,
  calendar,
  onCalendarChosen,
  notify,
  onBooked,
}: {
  /** A date was booked (for the timeline). */
  onBooked?: (b: { personId: string; venue: Venue; when: string }) => void;
  myName: string;
  calendar: string | null;
  onCalendarChosen: (calendar: string) => void;
  notify: (banner: Omit<Banner, "id">) => void;
}) {
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [museLog, setMuseLog] = useState<MuseLine[]>([]);
  const [museTyping, setMuseTyping] = useState(false);

  // Timers outlive renders, so they read the latest values from refs.
  const openRef = useRef<string | null>(null);
  const calendarRef = useRef(calendar);
  const notifyRef = useRef(notify);
  const bookedRef = useRef(onBooked);
  const plans = useRef<Record<string, Plan>>({});
  const threadsRef = useRef(threads);
  const replyIndex = useRef<Record<string, number>>({});
  useEffect(() => {
    calendarRef.current = calendar;
    notifyRef.current = notify;
    bookedRef.current = onBooked;
    threadsRef.current = threads;
  });

  const patch = useCallback(
    (tid: string, fn: (t: Thread) => Thread) => setThreads((list) => list.map((t) => (t.id === tid ? fn(t) : t))),
    [],
  );

  /** Append messages; the thread jumps to the top and counts as unread unless it's open. */
  const push = useCallback(
    (tid: string, ...messages: Message[]) =>
      patch(tid, (t) => ({
        ...t,
        messages: [...t.messages, ...messages],
        time: "Now",
        order: Date.now(),
        unread: openRef.current === tid ? 0 : t.unread + messages.filter((m) => !("from" in m) || m.from !== "me").length,
      })),
    [patch],
  );

  const patchMessage = useCallback(
    (tid: string, mid: string, change: Partial<Message>) =>
      patch(tid, (t) => ({ ...t, messages: t.messages.map((m) => (m.id === mid ? ({ ...m, ...change } as Message) : m)) })),
    [patch],
  );

  const typing = useCallback((tid: string, on: boolean) => patch(tid, (t) => ({ ...t, typing: on })), [patch]);

  /** The other person types for a moment, then says `text`. */
  const theySay = useCallback(
    (tid: string, text: string, delay = REPLY_DELAY, then?: () => void) => {
      setTimeout(() => typing(tid, true), TYPING_DELAY);
      setTimeout(() => {
        typing(tid, false);
        push(tid, { id: msgId(), from: "them", kind: "text", text });
        then?.();
      }, delay);
    },
    [push, typing],
  );

  /** Muse speaks in a chat (no typing indicator for Muse; it's quick). */
  const museSays = useCallback((tid: string, text: string, delay = 600) => {
    setTimeout(() => push(tid, { id: msgId(), kind: "muse", text }), delay);
  }, [push]);

  const nextReply = useCallback((personId: string) => {
    const lines = REPLIES[personId] ?? REPLIES.default;
    const i = replyIndex.current[personId] ?? 0;
    if (i >= lines.length) return null;
    replyIndex.current[personId] = i + 1;
    return lines[i];
  }, []);

  // ---------- Threads ----------

  const setOpen = useCallback(
    (tid: string | null) => {
      openRef.current = tid;
      if (tid) patch(tid, (t) => ({ ...t, unread: 0 }));
    },
    [patch],
  );

  /** Make sure a chat with this person exists. */
  const ensure = useCallback((personId: string, origin: Origin, status: Interest, first?: Message) => {
    const tid = threadIdFor(personId);
    setThreads((list) =>
      list.some((t) => t.id === tid)
        ? list
        : [{ id: tid, personId, status, origin, messages: first ? [first] : [], unread: 0, time: "Now", order: Date.now() }, ...list],
    );
    return tid;
  }, []);

  const becomeMutual = useCallback(
    (tid: string, divider: string) =>
      patch(tid, (t) =>
        t.status === "mutual" ? t : { ...t, status: "mutual", messages: [...t.messages, { id: msgId(), kind: "divider", text: divider }] },
      ),
    [patch],
  );

  const send = useCallback(
    (tid: string, text: string) => {
      const thread = threadsRef.current.find((t) => t.id === tid);
      if (!thread) return;
      if (thread.status === "likesYou") becomeMutual(tid, "You matched");
      push(tid, { id: msgId(), from: "me", kind: "text", text });
      // Before it's mutual, your first message waits for them.
      if (thread.status === "youLiked") return;
      const reply = nextReply(thread.personId);
      if (reply) theySay(tid, reply);
    },
    [becomeMutual, nextReply, push, theySay],
  );

  const sendMedia = useCallback(
    (tid: string, media: Media[]) => {
      push(tid, { id: msgId(), from: "me", kind: "media", media });
      theySay(tid, media.some((m) => m.kind === "video") ? "Okay, this is great. Sound on next time!" : "Okay, I love this.");
    },
    [push, theySay],
  );

  /** Accept someone's interest. */
  const matchBack = useCallback((tid: string) => becomeMutual(tid, "You matched"), [becomeMutual]);

  const remove = useCallback((tid: string) => setThreads((list) => list.filter((t) => t.id !== tid)), []);

  /** One tap: say you'd like to meet someone. The chat exists right away; Today's introduction answers after a moment. */
  const expressInterest = useCallback(
    ({ personId, origin, onMutual }: { personId: string; origin: Origin; onMutual?: () => void }) => {
      const person = PEOPLE[personId];
      const tid = ensure(personId, origin, "youLiked", { id: msgId(), kind: "divider", text: `You'd like to meet ${person.name}` });
      // People already open to chatting on Nearby match right away.
      if (person.nearby?.status === "chat" || person.nearby?.status === "interested") {
        becomeMutual(tid, "You matched");
        return tid;
      }
      if (origin === "Today") {
        setTimeout(() => {
          becomeMutual(tid, "It's mutual");
          const reply = nextReply(personId);
          if (reply) theySay(tid, reply, 1800);
          notifyRef.current({ title: "It's mutual", body: `${person.name} would like to meet you too.`, avatar: person.avatar, onOpen: onMutual });
        }, MUTUAL_DELAY);
      }
      return tid;
    },
    [becomeMutual, ensure, nextReply, theySay],
  );

  // ---------- Muse plans a date ----------

  const ask = useCallback(
    (tid: string, step: "when" | "what" | "budget" | "calendar", delay: number) => {
      const them = personOf(tid).name;
      const spec = {
        when: { question: `When are you free? I'm asking ${them} too.`, options: WHEN_OPTIONS, multi: true },
        what: { question: "What kind of date sounds good?", options: WHAT_OPTIONS },
        budget: { question: "Any budget in mind?", options: BUDGET_OPTIONS },
        calendar: { question: "Add it to which calendar?", options: CALENDARS },
      }[step];
      setTimeout(() => push(tid, { id: msgId(), kind: "museAsk", step, ...spec }), delay);
    },
    [push],
  );

  const startPlan = useCallback(
    (tid: string) => {
      const them = personOf(tid).name;
      plans.current[tid] = {};
      patch(tid, (t) => ({ ...t, planning: true }));
      push(tid, { id: msgId(), kind: "divider", text: "Muse joined to plan" });
      museSays(tid, `Hi ${myName} and ${them}! Three quick questions, then I'll book it.`, 300);
      ask(tid, "when", 1500);
    },
    [ask, museSays, myName, patch, push],
  );

  const book = useCallback(
    (tid: string) => {
      const plan = plans.current[tid];
      const venue = plan.venue!;
      const bookingId = msgId();
      push(tid, { id: bookingId, kind: "museBooking", venue, done: false });
      setTimeout(() => {
        patchMessage(tid, bookingId, { done: true });
        const when = slotLabel(plan.when!);
        const code = `TW-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const cal = calendarRef.current ?? CALENDARS[0];
        push(tid, { id: msgId(), kind: "museBooked", booking: { venue, when, code, calendar: cal } });
        museSays(tid, `All set. I'll remind you both ${dayName(plan.when!)} afternoon.`, 900);
        setTimeout(() => patch(tid, (t) => ({ ...t, planning: false })), 900);
        bookedRef.current?.({ personId: personOf(tid).id, venue, when });
        notifyRef.current({ title: "Date booked", body: `${venue.name} · ${when}. Added to ${cal.split(" · ")[0]}.`, muse: true });
      }, BOOKING_MS);
    },
    [museSays, patch, patchMessage, push],
  );

  const answer = useCallback(
    (tid: string, mid: string, step: string, mine: string[]) => {
      const them = personOf(tid).name;
      const update = (change: Plan) => (plans.current[tid] = { ...plans.current[tid], ...change });

      if (step === "calendar") {
        patchMessage(tid, mid, { mine });
        onCalendarChosen(mine[0]);
        calendarRef.current = mine[0];
        museSays(tid, `Got it. ${mine[0].split(" · ")[0]} from now on. Booking now.`, 400);
        setTimeout(() => book(tid), 1200);
        return;
      }

      patchMessage(tid, mid, { mine });
      const theirs =
        step === "when" ? THEIR_WHEN.join(", ") : step === "what" ? (mine[0] === "Dinner" ? "Dinner!" : `${mine[0]} sounds fun`) : "Somewhere with vegetarian options, please";
      setTimeout(() => typing(tid, true), 400);
      setTimeout(() => {
        typing(tid, false);
        patchMessage(tid, mid, { mine, theirs });

        if (step === "when") {
          const overlap = mine.find((s) => THEIR_WHEN.includes(s));
          const when = overlap ?? THEIR_WHEN[0];
          update({ when });
          museSays(
            tid,
            overlap
              ? `You're both free ${when.toLowerCase()}. ${dayName(when)} it is.`
              : `No overlap this time, but ${them} is free ${when.toLowerCase()}. I'll pencil in ${dayName(when)}, and you can change it later.`,
            300,
          );
          ask(tid, "what", 1400);
        } else if (step === "what") {
          update({ what: mine[0] });
          museSays(tid, `${mine[0]} it is.`, 300);
          ask(tid, "budget", 1100);
        } else if (step === "budget") {
          update({ budget: mine[0] });
          museSays(tid, `Three spots you'd both like. Tap your pick.`, 300);
          setTimeout(() => push(tid, { id: msgId(), kind: "museVenues", venues: VENUES[plans.current[tid]?.what ?? "Dinner"] ?? VENUES.Dinner }), 1700);
        }
      }, ANSWER_DELAY);
    },
    [ask, book, museSays, onCalendarChosen, patchMessage, push, typing],
  );

  const pickVenue = useCallback(
    (tid: string, mid: string, venue: Venue) => {
      plans.current[tid] = { ...plans.current[tid], venue };
      patchMessage(tid, mid, { picked: venue.id });
      theySay(tid, `${venue.name} was my pick too!`, 1700, () => {
        if (calendarRef.current) {
          museSays(tid, `A match on the first try. Booking ${venue.name} now.`, 500);
          setTimeout(() => book(tid), 1400);
        } else {
          ask(tid, "calendar", 600);
        }
      });
    },
    [ask, book, museSays, patchMessage, theySay],
  );

  // ---------- Chat with Muse ----------

  const sendToMuse = useCallback((text: string) => {
    setMuseLog((log) => [...log, { id: msgId(), from: "me", text }]);
    setMuseTyping(true);
    setTimeout(() => {
      setMuseTyping(false);
      setMuseLog((log) => [...log, { id: msgId(), from: "muse", text: museReply(text) }]);
    }, 1400);
  }, []);

  const sorted = useMemo(() => [...threads].sort((a, b) => b.order - a.order), [threads]);

  return {
    threads: sorted,
    museLog,
    museTyping,
    setOpen,
    ensure,
    send,
    sendMedia,
    matchBack,
    remove,
    expressInterest,
    startPlan,
    answer,
    pickVenue,
    sendToMuse,
  };
}

export type Chats = ReturnType<typeof useChats>;
