"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { MY_AREA, NEARBY_EVENTS, NEARBY_PEOPLE, type NearbyEvent, type Person } from "@/lib/app-data";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { SystemAlert, type AlertSpec } from "@/components/ios/SystemAlert";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { CalendarIcon, ChatBubbleIcon, ChevronDownIcon, EyeIcon, LocateIcon, PinIcon, PlusIcon } from "@/components/ui/icons";
import { BrandMark } from "@/components/brand/BrandMark";
import { HeartIcon } from "@/components/photos/StoryScan";
import { EventSheet } from "./EventSheet";
import { MaskGlyph, NearbyMap, type MapFilter, type Point } from "./NearbyMap";
import { PersonPeek } from "./PersonPeek";
import { PersonSheet } from "./PersonSheet";

// No "All" chip: tap a selected chip again to clear it.
const FILTERS: { id: MapFilter; label: string }[] = [
  { id: "interested", label: "Into you" },
  { id: "active", label: "Active now" },
  { id: "twine", label: "Twine events" },
  { id: "blind", label: "Blind dates" },
];

/** Casual and spontaneous: who's around, what's on, and who'd like to chat. Opt-in. */
export function NearbyTab({
  enabled,
  onEnable,
  chatting,
  going,
  hosted,
  onSayHi,
  onFullProfile,
  onRsvp,
  onHost,
}: {
  enabled: boolean;
  onEnable: () => void;
  /** People you already have a chat with. */
  chatting: Set<string>;
  going: Set<string>;
  /** Events you're hosting. */
  hosted: NearbyEvent[];
  onSayHi: (person: Person) => void;
  onFullProfile: (person: Person) => void;
  onRsvp: (event: NearbyEvent) => void;
  onHost: () => void;
}) {
  const [filter, setFilter] = useState<MapFilter>("all");
  const [focus, setFocus] = useState<(Point & { nonce: number }) | undefined>();
  const [person, setPerson] = useState<Person | null>(null);
  const [peek, setPeek] = useState<Person | null>(null);
  const [event, setEvent] = useState<NearbyEvent | null>(null);
  const [tray, setTray] = useState(true);
  // Where the tray folds to (the Twine events chip), relative to the tray, and a bump when it lands.
  const [fold, setFold] = useState({ x: 0, y: -600 });
  const [bump, setBump] = useState(0);
  // Red dots on chips with something new, until you've tapped them once.
  const [seen, setSeen] = useState<Set<MapFilter>>(new Set());
  const trayRef = useRef<HTMLDivElement>(null);
  const twineChip = useRef<HTMLButtonElement>(null);

  const measureFold = () => {
    const t = trayRef.current?.getBoundingClientRect();
    const c = twineChip.current?.getBoundingClientRect();
    if (!t || !c) return fold;
    // Bounding rects are in screen pixels; the phone frame may be scaled on desktop.
    const scale = t.width / (trayRef.current?.offsetWidth || t.width);
    return { x: (c.left + c.width / 2 - (t.left + t.width / 2)) / scale, y: (c.top + c.height / 2 - (t.top + t.height / 2)) / scale };
  };
  const hideTray = () => {
    // Bring the Twine events chip into view first, so the tray has somewhere to land.
    const chip = twineChip.current;
    const row = chip?.parentElement;
    if (chip && row) row.scrollTo({ left: Math.max(0, chip.offsetLeft - 60), behavior: "smooth" });
    setTimeout(() => {
      setFold(measureFold());
      setTray(false);
      setTimeout(() => setBump((b) => b + 1), 520);
    }, 180);
  };
  const pickFilter = (f: MapFilter) => {
    const next = filter === f ? "all" : f;
    setFilter(next);
    setSeen((s) => new Set(s).add(f));
    if (next === "twine" || next === "blind") setTray(true);
  };

  const events = [...hosted, ...NEARBY_EVENTS];
  const trayEvents = filter === "blind" ? events.filter((e) => e.kind === "blind") : filter === "twine" ? events.filter((e) => e.kind === "event" && !e.hosting) : events;
  const into = NEARBY_PEOPLE.filter((p) => p.nearby?.status === "interested" || p.nearby?.status === "chat").length;
  const panTo = (pt: Point) => setFocus({ ...pt, nonce: Date.now() });
  const openEvent = (e: NearbyEvent) => {
    panTo(e);
    setEvent(e);
  };

  if (!enabled) return <NearbyConsent onEnable={onEnable} />;

  return (
    <div className="absolute inset-0 bg-[#1B1B1F]">
      <NearbyMap people={NEARBY_PEOPLE} events={events} filter={filter} focus={focus} onTapPerson={setPerson} onHoldPerson={setPeek} onTapEvent={openEvent} />

      {/* Header */}
      <div className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="absolute inset-x-0 top-0 h-[200px]" style={{ background: "linear-gradient(#0B0A10 0%, rgba(11,10,16,0.9) 58%, transparent)" }} />
        <div className="relative flex items-center gap-2 px-5 pt-2">
          <h1 className="flex-1 text-[32px] font-bold tracking-[-0.03em]">Nearby</h1>
          <RoundButton label="Center on me" onPress={() => panTo(MY_AREA)}>
            <LocateIcon size={20} className="text-[#0A84FF]" />
          </RoundButton>
          <RoundButton label="Host an event" onPress={onHost} brand>
            <PlusIcon size={22} />
          </RoundButton>
        </div>
        <div className="no-scrollbar pointer-events-auto relative mt-3 flex gap-2 overflow-x-auto px-5 pb-2 pt-[3px]">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <motion.button
                key={f.id}
                ref={f.id === "twine" ? twineChip : undefined}
                type="button"
                onClick={() => pickFilter(f.id)}
                aria-pressed={on}
                animate={f.id === "twine" && bump ? { scale: [1, 1.18, 1] } : undefined}
                transition={{ duration: 0.4 }}
                className={`relative flex h-[40px] shrink-0 items-center gap-[6px] rounded-full border px-4 text-[15px] font-medium backdrop-blur-xl transition-colors ${
                  on ? "border-transparent bg-white text-black" : "border-white/12 bg-[#1C1A24]/75 text-white/85"
                }`}
              >
                {f.id === "interested" && <HeartIcon size={12} color={on ? "#FF3F6E" : "#FF8AA2"} />}
                {f.id === "active" && <span className="h-[8px] w-[8px] rounded-full bg-[#34C759]" />}
                {f.id === "twine" && <BrandMark width={14} />}
                {f.label}
                {f.id === "interested" && <span className={on ? "text-black/50" : "text-white/45"}>{into}</span>}
                {["active", "twine", "blind"].includes(f.id) && !seen.has(f.id) && (
                  <span className="absolute -right-[2px] -top-[2px] h-[11px] w-[11px] rounded-full bg-[#FF3B30] ring-2 ring-[#0B0A10]" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Events tray: hiding it folds it into the Twine events chip */}
      <div className="absolute inset-x-0 z-10" style={{ bottom: `calc(${TAB_BAR_SPACE} + 12px)` }}>
        <AnimatePresence initial={false} custom={fold}>
          {tray && (
            <motion.div
              key="tray"
              ref={trayRef}
              custom={fold}
              variants={FOLD}
              initial="folded"
              animate="open"
              exit="folded"
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <div className="mb-2 flex justify-end px-5">
                <RoundButton label="Hide events" onPress={hideTray} small>
                  <ChevronDownIcon size={18} />
                </RoundButton>
              </div>
              <div className="no-scrollbar flex snap-x snap-mandatory gap-[10px] overflow-x-auto px-5 pb-1">
                {trayEvents.map((e) => (
                  <motion.button
                    key={e.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openEvent(e)}
                    className="flex w-[250px] shrink-0 snap-start items-center gap-3 rounded-[22px] border border-white/10 p-[8px] pr-3 text-left shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                    style={{ background: "rgba(28,26,36,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
                  >
                    <span className="relative shrink-0">
                      <Photo src={e.photo} className="h-[60px] w-[60px] rounded-[15px]" />
                      <span
                        className="absolute -bottom-1 -right-1 flex h-[24px] w-[24px] items-center justify-center rounded-full ring-2 ring-[#1C1A24]"
                        style={{ background: e.kind === "blind" ? BRAND.colors.violet : `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
                      >
                        {e.kind === "blind" ? <MaskGlyph size={15} /> : e.hosting ? <CalendarIcon size={13} /> : <BrandMark width={13} tone="white" />}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-semibold">{e.title}</span>
                      <span className="block truncate text-[14px] text-white/55">
                        {e.hosting ? "You're hosting" : going.has(e.id) ? "You're going" : e.when}
                      </span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PersonPeek
        person={peek}
        onClose={() => setPeek(null)}
        onSayHi={() => {
          const p = peek!;
          setPeek(null);
          onSayHi(p);
        }}
        onFullProfile={() => {
          const p = peek!;
          setPeek(null);
          onFullProfile(p);
        }}
      />
      <PersonSheet
        person={person}
        chatting={person ? chatting.has(person.id) : false}
        onClose={() => setPerson(null)}
        onSayHi={() => {
          const p = person!;
          setPerson(null);
          onSayHi(p);
        }}
        onFullProfile={() => {
          const p = person!;
          setPerson(null);
          onFullProfile(p);
        }}
      />
      <EventSheet event={event} going={event ? going.has(event.id) || Boolean(event.hosting) : false} onClose={() => setEvent(null)} onRsvp={() => event && onRsvp(event)} />
    </div>
  );
}

function RoundButton({ label, onPress, brand = false, small = false, children }: { label: string; onPress: () => void; brand?: boolean; small?: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      onClick={onPress}
      className={`pointer-events-auto flex items-center justify-center rounded-full backdrop-blur-xl ${small ? "h-[44px] w-[44px]" : "h-[46px] w-[46px]"} ${brand ? "" : "border border-white/10 bg-[#1C1A24]/80"}`}
      style={brand ? { background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` } : undefined}
    >
      {children}
    </motion.button>
  );
}

const FOLD = {
  open: { x: 0, y: 0, scale: 1, opacity: 1 },
  folded: (to: { x: number; y: number }) => ({
    x: to.x,
    y: to.y,
    scale: 0.06,
    opacity: 0,
    transition: { duration: 0.55, ease: [0.5, 0, 0.75, 0.6] as const, opacity: { duration: 0.55, ease: "easeIn" as const } },
  }),
};

// ---------- Consent ----------

function NearbyConsent({ onEnable }: { onEnable: () => void }) {
  const [alert, setAlert] = useState<AlertSpec | null>(null);

  const answer = (allowed: boolean) => () => {
    setAlert(null);
    if (allowed) onEnable();
  };
  const ask = () =>
    setAlert({
      title: `Allow “${BRAND.name}” to use your location?`,
      message: "Only your neighborhood is shown.",
      stacked: true,
      buttons: [
        { label: "Allow While Using App", style: "preferred", onPress: answer(true) },
        { label: "Allow Once", onPress: answer(true) },
        { label: "Don't Allow", onPress: answer(false) },
      ],
    });

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0B0A10]">
      <div className="absolute inset-0 scale-110 opacity-70 blur-[14px]">
        <NearbyMap people={NEARBY_PEOPLE} events={NEARBY_EVENTS} filter="all" interactive={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0A10]/70 via-[#0B0A10]/55 to-[#0B0A10]/95" />

      <div className="pt-safe relative flex h-full flex-col px-6" style={{ paddingBottom: `calc(${TAB_BAR_SPACE} + 20px)` }}>
        <h1 className="pt-2 text-[32px] font-bold tracking-[-0.03em]">Nearby</h1>
        <div className="flex flex-1 flex-col justify-end">
          <h2 className="text-[30px] font-bold leading-[35px] tracking-[-0.03em]">Who&apos;s out tonight</h2>
          <div className="mt-6 space-y-4">
            <Point icon={<PinIcon size={20} />} text="Neighborhood only" />
            <Point icon={<EyeIcon size={20} />} text="Visible only when on" />
            <Point icon={<ChatBubbleIcon size={17} />} text="Chat when you both say hi" />
          </div>
          <div className="mt-8">
            <Button onClick={ask}>Turn on Nearby</Button>
          </div>
        </div>
      </div>
      <SystemAlert alert={alert} />
    </div>
  );
}

function Point({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[#FF8AA2]">{icon}</span>
      <span className="text-[17px] font-medium">{text}</span>
    </div>
  );
}
