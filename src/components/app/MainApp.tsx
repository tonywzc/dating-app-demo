"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PEOPLE, TODAYS_PICK, type NearbyEvent, type Person } from "@/lib/app-data";
import { DEFAULT_MUSE, PROFILE_PREFILL, type Account } from "@/lib/mock-data";
import type { Answers, Summary } from "@/lib/muse-script";
import { ChatThread } from "@/components/chats/ChatThread";
import { ChatsTab } from "@/components/chats/ChatsTab";
import { MuseChat } from "@/components/chats/MuseChat";
import { threadIdFor, useChats, type Banner } from "@/components/chats/useChats";
import { MuseFlow } from "@/components/muse/MuseFlow";
import type { ProfileBasics } from "@/components/muse/MuseResult";
import { NearbyTab } from "@/components/nearby/NearbyTab";
import type { Moment } from "@/components/photos/StoriesPick";
import { HeartIcon } from "@/components/photos/StoryScan";
import { ProfileBook } from "@/components/today/ProfileBook";
import { TodayTab, type TodayDecision } from "@/components/today/TodayTab";
import { DEFAULT_SETTINGS, SettingsScreen, type Settings } from "@/components/you/SettingsScreen";
import { YouTab, type Me } from "@/components/you/YouTab";
import { BannerHost } from "./Banner";
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
  };
}

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
  const [decision, setDecision] = useState<TodayDecision>(null);
  const [going, setGoing] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState(initialSummary);
  const [answers, setAnswers] = useState(initialAnswers);
  const [me, setMe] = useState<Me>(() => initialMe(profile, initialAnswers, moments));
  const [talking, setTalking] = useState(false);

  const notify = useCallback((b: Omit<Banner, "id">) => setBanner({ ...b, id: String(Date.now()) }), []);
  const dismissBanner = useCallback(() => setBanner(null), []);
  const onCalendarChosen = useCallback((calendar: string) => setSettings((s) => ({ ...s, calendar })), []);
  const chats = useChats({ myName, calendar: settings.calendar, onCalendarChosen, notify });

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
    setStack([]);
    chats.setOpen(null);
    setTab(t);
  };

  const openThread = (personId: string) => push({ kind: "thread", tid: threadIdFor(personId) });

  const pickThread = chats.threads.find((t) => t.personId === TODAYS_PICK.id);
  const unread = chats.threads.reduce((n, t) => n + t.unread, 0);
  const chatting = useMemo(() => new Set(chats.threads.map((t) => t.personId)), [chats.threads]);
  const museLast = chats.museLog.length
    ? chats.museLog[chats.museLog.length - 1].text
    : `Good morning, ${myName}. Today I'd like you to meet ${TODAYS_PICK.name}.`;

  const rsvp = (e: NearbyEvent) => {
    setGoing((g) => new Set(g).add(e.id));
    notify({
      title: e.kind === "blind" ? "Seat saved" : "You're going",
      body: `${e.title} · ${e.when}.${settings.calendar ? ` Added to ${settings.calendar.split(" · ")[0]}.` : ""}`,
      muse: true,
    });
  };

  const sayHiNearby = (p: Person, text: string) => {
    chats.expressInterest({ personId: p.id, origin: "Nearby", note: text });
    openThread(p.id);
  };

  return (
    <motion.div className="absolute inset-0 bg-[#0B0A10]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Tabs */}
      <div className="absolute inset-0">
        {tab === "today" && (
          <TodayTab
            person={TODAYS_PICK}
            muse={muse}
            decision={decision}
            mutual={pickThread?.status === "mutual"}
            onInterested={(draft) => {
              setDecision({ kind: "interested", note: draft.note, viaMuse: draft.viaMuse });
              chats.expressInterest({
                personId: TODAYS_PICK.id,
                origin: "Today",
                note: draft.note,
                about: draft.about,
                viaMuse: draft.viaMuse,
                onMutual: () => openThread(TODAYS_PICK.id),
              });
            }}
            onPass={(reasons) => setDecision({ kind: "passed", reasons })}
            onUndoPass={() => setDecision(null)}
            onOpenChat={() => openThread(TODAYS_PICK.id)}
            onReadAgain={() => push({ kind: "person", personId: TODAYS_PICK.id })}
            onOpenNearby={() => goTab("nearby")}
            onOpenMuse={() => push({ kind: "muse" })}
          />
        )}
        {tab === "nearby" && (
          <NearbyTab
            enabled={nearbyOn}
            onEnable={() => setNearbyOn(true)}
            chatting={chatting}
            going={going}
            onSayHi={sayHiNearby}
            onOpenChat={(p) => openThread(p.id)}
            onFullProfile={(p) => push({ kind: "person", personId: p.id })}
            onRsvp={rsvp}
          />
        )}
        {tab === "chats" && (
          <ChatsTab
            threads={chats.threads}
            muse={muse}
            museLast={museLast}
            onOpen={(tid) => push({ kind: "thread", tid })}
            onOpenMuse={() => push({ kind: "muse" })}
          />
        )}
        {tab === "you" && (
          <YouTab
            me={me}
            onChange={setMe}
            muse={muse}
            summary={summary}
            answers={answers}
            nearbyOn={nearbyOn}
            onNearby={setNearbyOn}
            onOpenSettings={() => push({ kind: "settings" })}
            onTalkToMuse={() => setTalking(true)}
          />
        )}
      </div>

      <TabBar tab={tab} onSelect={goTab} badges={{ chats: unread, today: decision ? undefined : "dot" }} />

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
                pick={TODAYS_PICK}
                log={chats.museLog}
                typing={chats.museTyping}
                onSend={chats.sendToMuse}
                onBack={pop}
                onTalk={() => setTalking(true)}
                onOpenToday={() => goTab("today")}
              />
            )}
            {screen.kind === "settings" && (
              <SettingsScreen
                account={account}
                settings={settings}
                onChange={setSettings}
                nearbyOn={nearbyOn}
                onNearby={setNearbyOn}
                onBack={pop}
                onOpenMuse={() => push({ kind: "muse" })}
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
              continueLabel="Save to my profile"
              onDone={(s, a) => {
                setSummary(s);
                setAnswers((prev) => ({ ...prev, ...a }));
                setTalking(false);
                notify({ title: `${muse.name} updated your profile`, body: "Tomorrow's introduction will use what you just shared.", muse: true });
              }}
            />
            <button
              type="button"
              onClick={() => setTalking(false)}
              className="pt-safe absolute right-4 top-0 z-10 mt-2 rounded-full bg-white/10 px-4 py-[7px] text-[14px] font-semibold backdrop-blur-xl"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
      />
    );
  }

  function personScreen(personId: string) {
    const person = PEOPLE[personId];
    const thread = chats.threads.find((t) => t.personId === personId);
    const canSayHi = !thread && personId !== TODAYS_PICK.id;
    return (
      <>
        <ProfileBook
          person={person}
          muse={muse}
          variant="view"
          bottomSpace={canSayHi || thread ? "120px" : "40px"}
          topLeft={<BackButton onPress={pop} />}
          label={
            <span className="rounded-full bg-black/40 px-3 py-[6px] text-[13px] font-semibold backdrop-blur-md">
              {personId === TODAYS_PICK.id ? "Today's introduction" : `From ${thread?.origin ?? "Nearby"}`}
            </span>
          }
        />
        {(canSayHi || thread) && (
          <div className="pb-safe absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0A0810] via-[#0A0810]/90 to-transparent px-5 pt-8">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => (thread ? openThread(personId) : sayHiNearby(person, `Hi ${person.name}! Your profile made me smile.`))}
              className="flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-white text-[17px] font-semibold text-black"
            >
              <HeartIcon size={16} color="#FF3F6E" />
              {thread ? `Message ${person.name}` : `Say hi to ${person.name}`}
            </motion.button>
          </div>
        )}
      </>
    );
  }
}

