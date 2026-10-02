"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { NEARBY_EVENTS, NEARBY_PEOPLE, type NearbyEvent, type Person } from "@/lib/app-data";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { SystemAlert, type AlertSpec } from "@/components/ios/SystemAlert";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { LocateIcon, PinIcon } from "@/components/ui/icons";
import { HeartIcon } from "@/components/photos/StoryScan";
import { EventSheet } from "./EventSheet";
import { MaskGlyph, NearbyMap, type MapFilter, type Point } from "./NearbyMap";
import { PersonPeek } from "./PersonPeek";
import { PersonSheet } from "./PersonSheet";

const FILTERS: { id: MapFilter; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "interested", label: "Into you" },
  { id: "tonight", label: "Free tonight" },
  { id: "events", label: "Events" },
  { id: "blind", label: "Blind dates" },
];

/** Casual and spontaneous: who's around, what's on, and who'd like to chat. Opt-in. */
export function NearbyTab({
  enabled,
  onEnable,
  chatting,
  going,
  onSayHi,
  onOpenChat,
  onFullProfile,
  onRsvp,
}: {
  enabled: boolean;
  onEnable: () => void;
  /** People you already have a chat with. */
  chatting: Set<string>;
  going: Set<string>;
  onSayHi: (person: Person, text: string) => void;
  onOpenChat: (person: Person) => void;
  onFullProfile: (person: Person) => void;
  onRsvp: (event: NearbyEvent) => void;
}) {
  const [filter, setFilter] = useState<MapFilter>("all");
  const [focus, setFocus] = useState<(Point & { nonce: number }) | undefined>();
  const [person, setPerson] = useState<Person | null>(null);
  const [peek, setPeek] = useState<Person | null>(null);
  const [event, setEvent] = useState<NearbyEvent | null>(null);

  const into = NEARBY_PEOPLE.filter((p) => p.nearby?.status === "interested" || p.nearby?.status === "chat").length;
  const panTo = (pt: Point) => setFocus({ ...pt, nonce: Date.now() });

  if (!enabled) return <NearbyConsent onEnable={onEnable} />;

  return (
    <div className="absolute inset-0 bg-[#1B1B1F]">
      <NearbyMap
        people={NEARBY_PEOPLE}
        events={NEARBY_EVENTS}
        filter={filter}
        focus={focus}
        onTapPerson={setPerson}
        onHoldPerson={setPeek}
        onTapEvent={(e) => {
          panTo(e);
          setEvent(e);
        }}
      />

      {/* Header */}
      <div className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="absolute inset-x-0 top-0 h-[200px]" style={{ background: "linear-gradient(#0B0A10 0%, rgba(11,10,16,0.9) 58%, transparent)" }} />
        <div className="relative flex items-center justify-between px-5 pt-2">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.03em]">Nearby</h1>
            <div className="mt-[1px] flex items-center gap-[6px] text-[13px] text-white/65">
              <span className="h-[7px] w-[7px] rounded-full bg-[#34C759]" />
              You&apos;re visible around Duboce Triangle
            </div>
          </div>
          <motion.button
            type="button"
            aria-label="Center on me"
            whileTap={{ scale: 0.9 }}
            onClick={() => panTo({ x: 760, y: 650 })}
            className="pointer-events-auto flex h-[44px] w-[44px] items-center justify-center rounded-full border border-white/10 bg-[#1C1A24]/80 text-[#0A84FF] backdrop-blur-xl"
          >
            <LocateIcon size={19} />
          </motion.button>
        </div>
        <div className="no-scrollbar pointer-events-auto relative mt-3 flex gap-2 overflow-x-auto px-5 pb-2">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={on}
                className={`flex shrink-0 items-center gap-[6px] rounded-full border px-[14px] py-[7px] text-[14px] font-medium backdrop-blur-xl transition-colors ${
                  on ? "border-transparent bg-white text-black" : "border-white/12 bg-[#1C1A24]/75 text-white/85"
                }`}
              >
                {f.id === "interested" && <HeartIcon size={11} color={on ? "#FF3F6E" : "#FF8AA2"} />}
                {f.label}
                {f.id === "interested" && <span className={on ? "text-black/50" : "text-white/45"}>{into}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Happening near you */}
      <div className="absolute inset-x-0 z-10" style={{ bottom: `calc(${TAB_BAR_SPACE} + 12px)` }}>
        <div className="mb-2 flex items-center justify-between px-5">
          <span className="rounded-full bg-black/55 px-3 py-[3px] text-[13px] font-semibold backdrop-blur-md">Happening near you</span>
          <span className="rounded-full bg-black/55 px-3 py-[3px] text-[12px] text-white/60 backdrop-blur-md">Hold a face to peek</span>
        </div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-[10px] overflow-x-auto px-5 pb-1">
          {NEARBY_EVENTS.map((e) => (
            <motion.button
              key={e.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                panTo(e);
                setEvent(e);
              }}
              className="flex w-[268px] shrink-0 snap-start items-center gap-3 rounded-[22px] border border-white/10 p-[8px] pr-3 text-left shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
              style={{ background: "rgba(28,26,36,0.86)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <span className="relative shrink-0">
                <Photo src={e.photo} className="h-[64px] w-[64px] rounded-[15px]" />
                {e.kind === "blind" && (
                  <span className="absolute -bottom-1 -right-1 flex h-[24px] w-[24px] items-center justify-center rounded-full ring-2 ring-[#1C1A24]" style={{ background: BRAND.colors.violet }}>
                    <MaskGlyph size={15} />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[11px] font-bold uppercase tracking-[0.06em] ${e.kind === "blind" ? "text-[#A98BFF]" : "text-[#FF8AA2]"}`}>
                  {e.kind === "blind" ? "Blind date" : "Event"} &middot; {e.when}
                </span>
                <span className="mt-[1px] block truncate text-[16px] font-semibold">{e.title}</span>
                <span className="block truncate text-[13px] text-white/55">
                  {e.where} &middot; {going.has(e.id) ? "You're going" : e.detail}
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <PersonPeek
        person={peek}
        onClose={() => setPeek(null)}
        onSayHi={() => {
          setPerson(peek);
          setPeek(null);
        }}
        onFullProfile={() => {
          const p = peek;
          setPeek(null);
          if (p) onFullProfile(p);
        }}
      />
      <PersonSheet
        person={person}
        chatting={person ? chatting.has(person.id) : false}
        onClose={() => setPerson(null)}
        onSayHi={(text) => {
          const p = person!;
          setPerson(null);
          onSayHi(p, text);
        }}
        onOpenChat={() => {
          const p = person!;
          setPerson(null);
          onOpenChat(p);
        }}
        onFullProfile={() => {
          const p = person!;
          setPerson(null);
          onFullProfile(p);
        }}
      />
      <EventSheet event={event} going={event ? going.has(event.id) : false} onClose={() => setEvent(null)} onRsvp={() => event && onRsvp(event)} />
    </div>
  );
}

// ---------- Consent ----------

function NearbyConsent({ onEnable }: { onEnable: () => void }) {
  const [alert, setAlert] = useState<AlertSpec | null>(null);
  const [declined, setDeclined] = useState(false);

  const answer = (allowed: boolean) => () => {
    setAlert(null);
    if (allowed) onEnable();
    else setDeclined(true);
  };
  const ask = () =>
    setAlert({
      title: `Allow “${BRAND.name}” to use your location?`,
      message: "Nearby shows your neighborhood, never your exact spot, and only while Nearby is on.",
      stacked: true,
      buttons: [
        { label: "Allow While Using App", style: "preferred", onPress: answer(true) },
        { label: "Allow Once", onPress: answer(true) },
        { label: "Don't Allow", onPress: answer(false) },
      ],
    });

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0B0A10]">
      {/* The map, waiting behind frosted glass */}
      <div className="absolute inset-0 scale-110 opacity-70 blur-[14px]">
        <NearbyMap people={NEARBY_PEOPLE} events={NEARBY_EVENTS} filter="all" interactive={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0A10]/70 via-[#0B0A10]/55 to-[#0B0A10]/95" />

      <div className="pt-safe relative flex h-full flex-col px-6" style={{ paddingBottom: `calc(${TAB_BAR_SPACE} + 20px)` }}>
        <h1 className="pt-2 text-[30px] font-bold tracking-[-0.03em]">Nearby</h1>
        <div className="flex flex-1 flex-col justify-end">
          <motion.div
            className="flex h-[64px] w-[64px] items-center justify-center rounded-[20px]"
            style={{ background: `linear-gradient(140deg, ${BRAND.colors.roseTop}, ${BRAND.colors.violet})` }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <PinIcon size={32} strokeWidth={2.2} className="text-white" />
          </motion.div>
          <h2 className="mt-5 text-[30px] font-bold leading-[35px] tracking-[-0.03em]">For tonight, not forever</h2>
          <p className="mt-2 text-[16px] leading-[23px] text-white/65">
            Nearby is the easygoing side of {BRAND.name}: who&apos;s around, what&apos;s on, and blind dates Muse sets up for you.
          </p>
          <div className="mt-6 space-y-4">
            <Point icon="📍" title="Neighborhood only" body="Others see your area, never your exact spot." />
            <Point icon="👀" title="Only while it's on" body="You show up on the map only when Nearby is on. Turn it off any time." />
            <Point icon="💬" title="Nothing until you both say hi" body="A ring means someone's into you. A chat opens when you both want it." />
          </div>
          <div className="mt-8">
            <Button onClick={ask}>Turn on Nearby</Button>
            <p className="mt-2 h-[18px] text-center text-[13px] text-white/45">
              {declined ? "Nearby needs your location to show what's around you." : "You can change this in Settings."}
            </p>
          </div>
        </div>
      </div>
      <SystemAlert alert={alert} />
    </div>
  );
}

function Point({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[17px]">{icon}</span>
      <div>
        <div className="text-[16px] font-semibold">{title}</div>
        <div className="text-[14px] leading-[19px] text-white/55">{body}</div>
      </div>
    </div>
  );
}

