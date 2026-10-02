"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MY_AREA, PEOPLE, SEED_TIMELINE, TODAY_PICKS, type NearbyEvent, type Person, type TimelineEntry } from "@/lib/app-data";
import { DEFAULT_MUSE, PROFILE_PREFILL, TOP_STORIES, type Account } from "@/lib/mock-data";
import type { Answers, Summary } from "@/lib/muse-script";
import { ChatThread } from "@/components/chats/ChatThread";
import { ChatsTab } from "@/components/chats/ChatsTab";
import { MuseChat } from "@/components/chats/MuseChat";
import { threadIdFor, useChats, type Banner } from "@/components/chats/useChats";
import { MuseFlow } from "@/components/muse/MuseFlow";
import type { ProfileBasics } from "@/components/muse/MuseResult";
import { NearbyTab } from "@/components/nearby/NearbyTab";
import type { Moment } from "@/components/photos/StoriesPick";
import { ChatBubbleIcon, CloseIcon } from "@/components/ui/icons";
import { ProfileBook } from "@/components/today/ProfileBook";
import { TodayTab, type TodayDecision } from "@/components/today/TodayTab";
import { DEFAULT_SETTINGS, SettingsScreen, type Settings } from "@/components/you/SettingsScreen";
import { HostSheet, type HostPlan } from "@/components/nearby/HostSheet";
import { YouTab, type Me } from "@/components/you/YouTab";
import { BannerHost } from "./Banner";
import { CheckInDialog } from "./CheckInDialog";
import { PlusSheet, type PlusFeature } from "./PlusSheet";
import { BackButton, PushScreen } from "./PushScreen";
import { TabBar, type Tab } from "./TabBar";

type Pushed = { kind: "thread"; tid: string } | { kind: "muse" } | { kind: "settings" } | { kind: "person"; personId: string };

const TABS: Tab[] = ["today", "nearby", "chats", "you"];

/** `?tab=nearby` opens a tab directly (with `?start=app`). */
function startTab(): Tab {
  const tab = new URLSearchParams(window.location.search).get("tab") as Tab | null;
  return tab && TABS.includes(tab) ? tab : "today";
}

const LOOKING_OPTIONS = ["Finding my person", "Something serious, no rush", "Seeing where it goes"];

function initialMe(profile: ProfileBasics, answers: Answers, moments: Moment[]): Me {
  const fields = [...PROFILE_PREFILL.basics, ...PROFILE_PREFILL.life].map((f) =>
    f.id === "name" ? { ...f, value: profile.firstName } : f.id === "location" ? { ...f, value: profile.location } : f,
  );
  return {
    fields: [
      ...fields,
      { id: "looking", label: "Here for", kind: "choice", options: LOOKING_OPTIONS, value: answers.looking ?? LOOKING_OPTIONS[1] },
    ],
    interests: PROFILE_PREFILL.interests,
    moments,
    showMutuals: true,
    story: [
      {
        id: "roots",
        title: "Roots",
        headline: "Sunday dinners at grandma's",
        text: "Grew up in a big, loud family. Everyone crammed around one table, and grandma made sure every plate was full before she sat down.",
        photo: TOP_STORIES[3].src,
      },
      {
        id: "growing",
        title: "Growing up",
        headline: "The calm one in the chaos",
        text: "The kid who remembered everyone's birthday, and the one friends called when things got loud.",
      },
      {
        id: "turning",
        title: "Turning points",
        headline: "Berkeley, then product",
        text: "Studied at UC Berkeley, found product work, and learned to cook properly in a tiny first apartment.",
        photo: TOP_STORIES[1].src,
      },
      {
        id: "now",
        title: "Now",
        headline: "Trails, then the kitchen",
        text: `Lives in ${profile.location.split(",")[0]}. Hikes in Marin on weekends and makes fresh pasta for friends, round four and counting.`,
        photo: TOP_STORIES[0].src,
      },
    ],
  };
}

/** Extra introductions a week with Plus (10 instead of 7). */
const PLUS_EXTRAS = 3;

/** The app after onboarding: Today, Nearby, Chats and You. */
export function MainApp({
  account,
  profile,
  summary: initialSummary,
  answers: initialAnswers,
  moments,
  onLogOut,
  onReplay,
}: {
  account: Account;
  profile: ProfileBasics;
  summary: Summary;
  answers: Answers;
  moments: Moment[];
  onLogOut: () => void;
  onReplay: () => void;
}) {
  const muse = account.muse ?? DEFAULT_MUSE;
  const myName = profile.firstName;
  const [tab, setTab] = useState<Tab>(startTab);
  const [stack, setStack] = useState<Pushed[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [nearbyOn, setNearbyOn] = useState(false);
  const [pickIndex, setPickIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, TodayDecision>>({});
  const [going, setGoing] = useState<Set<string>>(new Set());
  const [hosted, setHosted] = useState<NearbyEvent[]>([]);
  const [hosting, setHosting] = useState(false);
  const [summary, setSummary] = useState(initialSummary);
  const [answers, setAnswers] = useState(initialAnswers);
  const [me, setMe] = useState<Me>(() => initialMe(profile, initialAnswers, moments));
  const [talking, setTalking] = useState(false);
  const [reading, setReading] = useState(false);
  // Muse's first unread message offers to sort the inbox, to bring people into her chat.
  const [chatMode, setChatMode] = useState<"list" | "sorting" | "sorted">("list");
  const [museUnread, setMuseUnread] = useState(true);
  const [museOffer, setMuseOffer] = useState(true);
  const sortInbox = () => {
    setMuseOffer(false);
    setMuseUnread(false);
    setChatMode("sorting");
    setTimeout(() => setChatMode("sorted"), 1100);
  };
  const [timeline, setTimeline] = useState<TimelineEntry[]>(SEED_TIMELINE);
  const [checkIn, setCheckIn] = useState<TimelineEntry | null>(null);
  const addToTimeline = (entry: Omit<TimelineEntry, "id" | "status">) =>
    setTimeline((list) => [{ ...entry, id: `tl-${Date.now()}`, status: "upcoming" }, ...list]);

  // Coming back to the app: ask about the last date we haven't heard about.
  useEffect(() => {
    const t = setTimeout(() => setCheckIn(SEED_TIMELINE.find((e) => e.status === "pending") ?? null), 1600);
    return () => clearTimeout(t);
  }, []);

  // Twine Plus. Plan a date and Host an event are free once.
  const [plus, setPlus] = useState(false);
  const [upsell, setUpsell] = useState<{ feature: PlusFeature; demo: boolean; run?: () => void } | null>(null);
  const [uses, setUses] = useState<Record<PlusFeature, number>>({ date: 0, event: 0, more: 0 });
  const [extrasLeft, setExtrasLeft] = useState(PLUS_EXTRAS);

  const notify = useCallback((b: Omit<Banner, "id">) => setBanner({ ...b, id: String(Date.now()) }), []);
  const dismissBanner = useCallback(() => setBanner(null), []);
  const onCalendarChosen = useCallback((calendar: string) => setSettings((s) => ({ ...s, calendar })), []);
  const onBooked = useCallback(
    ({ personId, venue, when }: { personId: string; venue: { name: string; photo: string }; when: string }) =>
      setTimeline((list) => [
        { id: `tl-${Date.now()}`, kind: "date", title: `${venue.name} with ${PEOPLE[personId].name}`, when, with: [PEOPLE[personId].avatar], photo: venue.photo, status: "upcoming" },
        ...list,
      ]),
    [],
  );
  const chats = useChats({ myName, calendar: settings.calendar, onCalendarChosen, notify, onBooked });

  const push = (screen: Pushed) => {
    if (screen.kind === "thread") chats.setOpen(screen.tid);
    setStack((s) => [...s, screen]);
  };
  const pop = () => {
    setStack((s) => {
      const next = s.slice(0, -1);
      const below = next[next.length - 1];
      chats.setOpen(below?.kind === "thread" ? below.tid : null);
      return next;
    });
  };
  const goTab = (t: Tab) => {
    setReading(false);
    setStack([]);
    chats.setOpen(null);
    setTab(t);
  };

  const openThread = (personId: string) => push({ kind: "thread", tid: threadIdFor(personId) });

  /** Use a Plus feature: the first try says it's Plus but lets you in (demo mode); after that, the upsell. */
  const gate = (feature: PlusFeature, run: () => void) => {
    if (plus) return run();
    if (uses[feature] >= 1) return setUpsell({ feature, demo: false });
    setUpsell({
      feature,
      demo: true,
      run: () => {
        setUses((u) => ({ ...u, [feature]: u[feature] + 1 }));
        run();
      },
    });
  };

  const pick = TODAY_PICKS[pickIndex];
  const pickThread = chats.threads.find((t) => t.personId === pick.id);
  const unread = chats.threads.reduce((n, t) => n + t.unread, 0);
  const chatting = useMemo(() => new Set(chats.threads.map((t) => t.personId)), [chats.threads]);
  const museLast = chats.museLog.length ? chats.museLog[chats.museLog.length - 1].text : `Morning, ${myName}. Ask me anything.`;

  const nextPick = () => {
    if (extrasLeft === 0 || pickIndex >= TODAY_PICKS.length - 1) {
      notify({ title: "That's everyone for today", body: "More tomorrow at 9.", muse: true });
      return;
    }
    setExtrasLeft((n) => n - 1);
    setPickIndex((i) => i + 1);
  };
  const seeAnother = () => gate("more", nextPick);

  const sayHi = (p: Person, origin: "Today" | "Nearby") => {
    chats.expressInterest({ personId: p.id, origin, onMutual: () => openThread(p.id) });
    openThread(p.id);
  };

  const rsvp = (e: NearbyEvent) => {
    setGoing((g) => new Set(g).add(e.id));
    addToTimeline({ kind: e.kind === "blind" ? "blind" : "event", title: e.title, when: e.when, with: e.faces ?? [], photo: e.photo });
    notify({ title: e.kind === "blind" ? "Seat saved" : "You're going", body: `${e.title} · ${e.when}`, muse: true });
  };

  const host = (plan: HostPlan) => {
    setHosting(false);
    const id = `host-${Date.now()}`;
    const event: NearbyEvent = {
      id,
      kind: "event",
      title: plan.kind.label,
      when: plan.when,
      where: "Duboce Triangle",
      photo: plan.kind.photo,
      detail: `${plan.size} people`,
      blurb: `Hosted by ${myName}. We'll invite people nearby you'd get along with.`,
      x: MY_AREA.x + 40,
      y: MY_AREA.y - 30,
      hosting: true,
    };
    setHosted((list) => [event, ...list]);
    addToTimeline({ kind: "hosted", title: plan.kind.label, when: plan.when, with: [], photo: plan.kind.photo });
    notify({ title: "You're hosting", body: `${plan.kind.label} · ${plan.when}. Invites are going out.`, muse: true });
  };

  const subscribe = () => {
    setUpsell(null);
    setPlus(true);
    notify({ title: "Welcome to Plus", body: "Dates, events and 3 more people a week.", muse: true });
  };

  return (
    <motion.div className="absolute inset-0 bg-[#0B0A10]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Tabs */}
      <div className="absolute inset-0">
        {tab === "today" && (
          <TodayTab
            person={pick}
            decision={decisions[pick.id] ?? null}
            mutual={pickThread?.status === "mutual"}
            plus={plus}
            extrasLeft={extrasLeft}
            onInterested={() => {
              setDecisions((d) => ({ ...d, [pick.id]: "interested" }));
              sayHi(pick, "Today");
            }}
            onPass={() => setDecisions((d) => ({ ...d, [pick.id]: "passed" }))}
            onUndoPass={() => setDecisions((d) => ({ ...d, [pick.id]: null }))}
            onOpenChat={() => openThread(pick.id)}
            onReadAgain={() => push({ kind: "person", personId: pick.id })}
            onSeeAnother={seeAnother}
            onImmersive={setReading}
            immersive={reading && !decisions[pick.id]}
            distance={settings.distance}
            onDistance={(distance) => {
              setSettings((st) => ({ ...st, distance }));
              notify({ title: distance === "Anywhere" ? "Anywhere nearby" : `Within ${distance}`, body: "Your next introductions will use this.", muse: true });
            }}
          />
        )}
        {tab === "nearby" && (
          <NearbyTab
            enabled={nearbyOn}
            onEnable={() => setNearbyOn(true)}
            chatting={chatting}
            going={going}
            hosted={hosted}
            onSayHi={(p) => (chatting.has(p.id) ? openThread(p.id) : sayHi(p, "Nearby"))}
            onFullProfile={(p) => push({ kind: "person", personId: p.id })}
            onRsvp={rsvp}
            onHost={() => gate("event", () => setHosting(true))}
          />
        )}
        {tab === "chats" && (
          <ChatsTab
            threads={chats.threads}
            muse={muse}
            museLast={museLast}
            onOpen={(tid) => push({ kind: "thread", tid })}
            onOpenMuse={() => {
              setMuseUnread(false);
              push({ kind: "muse" });
            }}
            mode={chatMode}
            museUnread={museUnread}
            museOffer={museOffer}
            onSort={sortInbox}
            onUnsort={() => setChatMode("list")}
          />
        )}
        {tab === "you" && (
          <YouTab
            me={me}
            onChange={setMe}
            muse={muse}
            summary={summary}
            onOpenSettings={() => push({ kind: "settings" })}
            timeline={timeline}
            onCheckIn={setCheckIn}
            onTalkToMuse={() => setTalking(true)}
          />
        )}
      </div>

      <TabBar tab={tab} onSelect={goTab} hidden={tab === "today" && reading && !decisions[pick.id]} badges={{ chats: unread + (museUnread ? 1 : 0), today: decisions[pick.id] ? undefined : "dot" }} />

      {/* Pushed screens */}
      <AnimatePresence>
        {stack.map((screen, i) => (
          <PushScreen key={`${screen.kind}-${i}`} z={35 + i}>
            {screen.kind === "thread" && threadScreen(screen.tid)}
            {screen.kind === "muse" && (
              <MuseChat
                muse={muse}
                myName={myName}
                summary={summary}
                answers={answers}
                pick={pick}
                log={chats.museLog}
                typing={chats.museTyping}
                onSend={chats.sendToMuse}
                onBack={pop}
                onTalk={() => setTalking(true)}
                offer={
                  museOffer
                    ? {
                        text: `Your inbox is getting busy: ${chats.threads.length} chats. Want me to sort it?`,
                        label: "Sort inbox",
                        onPress: () => {
                          goTab("chats");
                          sortInbox();
                        },
                      }
                    : undefined
                }
              />
            )}
            {screen.kind === "settings" && (
              <SettingsScreen
                account={account}
                settings={settings}
                onChange={setSettings}
                nearbyOn={nearbyOn}
                onNearby={setNearbyOn}
                plus={plus}
                onPlus={() => setUpsell({ feature: "date", demo: false })}
                onBack={pop}
                onLogOut={onLogOut}
                onReplay={onReplay}
              />
            )}
            {screen.kind === "person" && personScreen(screen.personId)}
          </PushScreen>
        ))}
      </AnimatePresence>

      {/* Talk to Muse (voice), on top of everything */}
      <AnimatePresence>
        {talking && (
          <motion.div key="talk" className="absolute inset-0 z-[55]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MuseFlow
              account={account}
              profile={profile}
              continueLabel="Save"
              onDone={(s, a) => {
                setSummary(s);
                setAnswers((prev) => ({ ...prev, ...a }));
                setTalking(false);
                notify({ title: "Profile updated", body: "Tomorrow's introduction will use it.", muse: true });
              }}
            />
            <button
              type="button"
              aria-label="Close"
              onClick={() => setTalking(false)}
              className="absolute right-4 z-10 flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/10 backdrop-blur-xl"
              style={{ top: "calc(var(--safe-top) + 4px)" }}
            >
              <CloseIcon size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckInDialog
        entry={checkIn}
        onAnswer={(went, rating) => {
          const id = checkIn?.id;
          setCheckIn(null);
          setTimeline((list) => list.map((e) => (e.id === id ? { ...e, status: went ? "went" : "missed", rating } : e)));
        }}
      />
      <HostSheet open={hosting} onCreate={host} onClose={() => setHosting(false)} />
      <PlusSheet
        feature={upsell?.feature ?? null}
        demo={upsell?.demo}
        onSubscribe={subscribe}
        onTry={() => {
          const run = upsell?.run;
          setUpsell(null);
          if (run) setTimeout(run, 350);
        }}
        onClose={() => setUpsell(null)}
      />
      <BannerHost banner={banner} onDismiss={dismissBanner} />
    </motion.div>
  );

  // Render helpers (plain functions, not components, so screens keep their state across renders).
  function threadScreen(tid: string) {
    const thread = chats.threads.find((t) => t.id === tid);
    if (!thread) return null;
    return (
      <ChatThread
        thread={thread}
        chats={chats}
        muse={muse}
        myName={myName}
        onBack={pop}
        onOpenProfile={() => push({ kind: "person", personId: thread.personId })}
        onPlanDate={() => gate("date", () => chats.startPlan(thread.id))}
      />
    );
  }

  function personScreen(personId: string) {
    const person = PEOPLE[personId];
    const thread = chats.threads.find((t) => t.personId === personId);
    return (
      <>
        <ProfileBook
          person={person}
          variant="view"
          bottomSpace="120px"
          topLeft={<BackButton onPress={pop} />}
          label={<span />}
        />
        <div className="pb-safe absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0A0810] via-[#0A0810]/90 to-transparent px-5 pt-8">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (thread) return openThread(personId);
              if (personId === pick.id) setDecisions((d) => ({ ...d, [pick.id]: "interested" }));
              sayHi(person, person.nearby ? "Nearby" : "Today");
            }}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-white text-[17px] font-semibold text-black"
          >
            <ChatBubbleIcon size={17} />
            {thread ? "Open chat" : "Say hi"}
          </motion.button>
        </div>
      </>
    );
  }
}
