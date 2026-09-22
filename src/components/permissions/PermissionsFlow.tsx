"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { CAMERA_ROLL } from "@/lib/mock-data";
import { SystemAlert, type AlertSpec } from "@/components/ios/SystemAlert";
import { Button, TextButton } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Aurora } from "@/components/onboarding/AccountPicker";
import { NotificationsHero, PhotosHero, ShortcutHero, VoiceHero } from "./Previews";
import { SHORTCUT_LABEL, ShortcutSheet, type ShortcutChoice } from "./ShortcutSheet";

type PermissionId = "notifications" | "voice" | "photos" | "shortcut";
type Status = "pending" | "granted" | "limited" | "denied" | "skipped";

type Item = {
  id: PermissionId;
  /** Name in the checklist. */
  name: string;
  /** Its sheet: headline, one sentence, button. */
  headline: string;
  line: string;
  cta: string;
  icon: ReactNode;
  hero: ReactNode;
  optional?: boolean;
};

const ITEMS: Item[] = [
  {
    id: "notifications",
    name: "Notifications",
    headline: "Turn on notifications",
    line: "Know the moment you match, get a message, or an event is coming up.",
    cta: "Allow notifications",
    icon: <BellIcon />,
    hero: <NotificationsHero />,
  },
  {
    id: "voice",
    name: "Voice",
    headline: "Talk to Muse",
    line: "Tell your agent about you, and who you're hoping to meet.",
    cta: "Allow microphone",
    icon: <MicIcon />,
    hero: <VoiceHero />,
  },
  {
    id: "photos",
    name: "Photos & camera",
    headline: "Photos & camera",
    line: "Add real moments, and take a quick selfie to show it's really you.",
    cta: "Allow photos & camera",
    icon: <CameraIcon />,
    hero: <PhotosHero />,
  },
  {
    id: "shortcut",
    name: "Voice shortcut",
    headline: "Talk from anywhere",
    line: "Hold the Action Button to talk to Muse, even when the app is closed.",
    cta: "Set up shortcut",
    icon: <BoltIcon />,
    hero: <ShortcutHero />,
    optional: true,
  },
];

const APP = `“${BRAND.name}”`;

const resolved = (s: Status) => s !== "pending" && s !== "denied";

/**
 * Permission setup. The checklist is the hub; tapping a permission opens a sheet
 * with only that permission's examples. After a choice the sheet closes and the
 * next unanswered permission opens on its own.
 */
export function PermissionsFlow({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [status, setStatus] = useState<Record<PermissionId, Status>>({
    notifications: "pending",
    voice: "pending",
    photos: "pending",
    shortcut: "pending",
  });
  const [open, setOpen] = useState<PermissionId | null>(null);
  const [justAllowed, setJustAllowed] = useState(false);
  const [shortcut, setShortcut] = useState<ShortcutChoice | null>(null);
  const [alert, setAlert] = useState<AlertSpec | null>(null);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [shortcutRun, setShortcutRun] = useState(0);

  const done = ITEMS.filter((i) => resolved(status[i.id])).length;
  const allDone = done === ITEMS.length;
  const next = ITEMS.find((i) => !resolved(status[i.id]))?.id;

  useEffect(() => {
    if (!allDone || open || shortcutOpen) return;
    const t = setTimeout(onComplete, 900);
    return () => clearTimeout(t);
  }, [allDone, open, shortcutOpen, onComplete]);

  // Settle a permission: a quick check if allowed, close the sheet, then open the
  // next one nobody has answered yet (denied ones wait on the list, no nagging).
  const settle = (id: PermissionId, s: Status) => {
    setAlert(null);
    const updated = { ...status, [id]: s };
    setStatus(updated);
    const upcoming = ITEMS.find((i) => updated[i.id] === "pending")?.id ?? null;
    const allowed = s === "granted" || s === "limited";
    const close = () => {
      setJustAllowed(false);
      setOpen(null);
      if (upcoming) setTimeout(() => setOpen(upcoming), 450);
    };
    if (allowed && open) {
      setJustAllowed(true);
      setTimeout(close, 800);
    } else {
      close();
    }
  };
  const answer = (id: PermissionId, s: Status) => () => settle(id, s);

  const confirmSkip = () =>
    setAlert({
      title: "Are you sure?",
      message: `These permissions are really useful \u{1F979} Without them, you could miss matches, messages, and chats with your agent.`,
      buttons: [
        {
          label: "Skip anyway",
          onPress: () => {
            setAlert(null);
            onSkip();
          },
        },
        { label: "Keep going", style: "preferred", onPress: () => setAlert(null) },
      ],
    });

  const askCamera = (photos: Status) =>
    setAlert({
      title: `${APP} Would Like to Access the Camera`,
      message: "Take a quick selfie to verify it's really you, and capture new moments for your profile.",
      buttons: [
        { label: "Don’t Allow", onPress: answer("photos", "denied") },
        { label: "Allow", style: "preferred", onPress: answer("photos", photos) },
      ],
    });

  const request = (id: PermissionId) => {
    switch (id) {
      case "notifications":
        return setAlert({
          title: `${APP} Would Like to Send You Notifications`,
          message: "Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.",
          buttons: [
            { label: "Don’t Allow", onPress: answer(id, "denied") },
            { label: "Allow", style: "preferred", onPress: answer(id, "granted") },
          ],
        });
      case "voice":
        return setAlert({
          title: `${APP} Would Like to Access the Microphone`,
          message: `Talk to your ${BRAND.name} agent about yourself and your ideal partner. It only listens while you're talking to it.`,
          buttons: [
            { label: "Don’t Allow", onPress: answer(id, "denied") },
            { label: "Allow", style: "preferred", onPress: answer(id, "granted") },
          ],
        });
      case "photos":
        return setAlert({
          title: `${APP} Would Like to Access Your Photos`,
          message: "Pick your best moments for your profile. Nothing is shared unless you add it.",
          accessory: <LibraryPeek />,
          stacked: true,
          buttons: [
            { label: "Limit Access…", onPress: () => askCamera("limited") },
            { label: "Allow Full Access", onPress: () => askCamera("granted") },
            { label: "Don’t Allow", onPress: answer(id, "denied") },
          ],
        });
      case "shortcut":
        // Hand over to the shortcut sheet.
        setOpen(null);
        setShortcutRun((n) => n + 1);
        return setTimeout(() => setShortcutOpen(true), 300);
    }
  };

  const statusLabel = (id: PermissionId): string | null => {
    switch (status[id]) {
      case "granted":
        return id === "shortcut" && shortcut ? SHORTCUT_LABEL[shortcut] : "On";
      case "limited":
        return "On · Selected photos";
      case "skipped":
        return "Skipped";
      case "denied":
        return "Not now · Tap to turn on";
      default:
        return id === next ? "Up next" : null;
    }
  };


  return (
    <motion.div
      className="absolute inset-0 bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      {/* Checklist hub */}
      <div className="pt-safe pb-safe absolute inset-0 flex flex-col">
        <Aurora />

        {!allDone && (
          <button
            type="button"
            onClick={confirmSkip}
            className="absolute right-4 top-[calc(var(--safe-top)+6px)] z-10 h-[36px] rounded-full bg-white/10 px-4 text-[15px] font-semibold text-white/80 backdrop-blur-xl active:opacity-60"
          >
            Skip
          </button>
        )}

        <div className="relative px-6 pt-14">
          <h1 className="text-[34px] font-bold leading-[40px] tracking-[-0.03em]">
            Let&apos;s set up
            <br />
            {BRAND.name}
          </h1>
          <p className="mt-2 text-[15px] leading-[21px] text-white/55">A few quick permissions. Change them anytime in Settings.</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex flex-1 gap-[6px]">
              {ITEMS.map((i) => (
                <div key={i.id} className="h-[4px] flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
                    initial={false}
                    animate={{ width: resolved(status[i.id]) ? "100%" : "0%" }}
                    transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </div>
              ))}
            </div>
            <span className="text-[13px] font-medium tabular-nums text-white/55">
              {done} of {ITEMS.length}
            </span>
          </div>
        </div>

        <div className="relative mt-8 space-y-[10px] px-4">
          {ITEMS.map((item) => (
            <PermissionRow
              key={item.id}
              item={item}
              status={status[item.id]}
              label={statusLabel(item.id)}
              isNext={item.id === next}
              onPress={() => !resolved(status[item.id]) && setOpen(item.id)}
            />
          ))}
        </div>
      </div>

      <PermissionSheet
        id={open}
        allowed={justAllowed}
        onClose={() => setOpen(null)}
        onAllow={(id) => request(id)}
        onNotNow={(id) => settle(id, "skipped")}
      />

      <SystemAlert alert={alert} />
      <ShortcutSheet
        key={shortcutRun}
        open={shortcutOpen}
        onClose={() => setShortcutOpen(false)}
        onSkip={() => {
          setShortcutOpen(false);
          settle("shortcut", "skipped");
        }}
        onComplete={(choice) => {
          setShortcut(choice);
          setShortcutOpen(false);
          settle("shortcut", "granted");
        }}
      />
    </motion.div>
  );
}

function PermissionSheet({
  id,
  allowed,
  onClose,
  onAllow,
  onNotNow,
}: {
  id: PermissionId | null;
  allowed: boolean;
  onClose: () => void;
  onAllow: (id: PermissionId) => void;
  onNotNow: (id: PermissionId) => void;
}) {
  // Keep showing the last item while the sheet animates closed.
  const [shown, setShown] = useState(id);
  if (id && id !== shown) setShown(id);
  const item = ITEMS.find((i) => i.id === shown);

  return (
    <Sheet open={id !== null} onClose={onClose} size="large">
      {item && (
        <div key={item.id} className="flex min-h-0 flex-1 flex-col">
          <div className="text-center text-[13px] font-medium tabular-nums text-white/40">
            {ITEMS.indexOf(item) + 1} of {ITEMS.length}
          </div>

          {/* The examples get the room */}
          <div className="flex min-h-0 flex-1 items-center justify-center px-1">{item.hero}</div>

          <div className="pb-1">
            <h2 className="text-[26px] font-bold leading-[32px] tracking-[-0.02em]">{item.headline}</h2>
            <p className="mt-[6px] text-[15px] leading-[21px] text-white/60">{item.line}</p>
            <div className="mt-5">
              <Button onClick={() => onAllow(item.id)}>{item.cta}</Button>
              <div className="mt-1 flex h-[44px] justify-center">
                {item.optional && (
                  <TextButton onClick={() => onNotNow(item.id)} className="text-white/70">
                    Not now
                  </TextButton>
                )}
              </div>
            </div>
          </div>

          {/* Allowed: a quick check, then on to the next one */}
          <AnimatePresence>
            {allowed && (
              <motion.div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-t-[38px] bg-[#1C1B22]/90 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="flex h-[84px] w-[84px] items-center justify-center rounded-full"
                  style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 16 }}
                >
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.1 }} />
                  </svg>
                </motion.div>
                <div className="mt-4 text-[17px] font-semibold">{item.name} on</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Sheet>
  );
}

function PermissionRow({
  item,
  status,
  label,
  isNext,
  onPress,
}: {
  item: Item;
  status: Status;
  label: string | null;
  isNext: boolean;
  onPress: () => void;
}) {
  const isDone = resolved(status);
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={isDone ? undefined : { scale: 0.985 }}
      aria-label={isDone ? `${item.name}: ${label}` : `Set up ${item.name}`}
      className={`flex w-full items-center gap-3 rounded-[22px] border p-4 text-left transition-colors ${
        isNext ? "border-white/25 bg-white/[0.09]" : "border-white/[0.07] bg-white/[0.04]"
      } ${isDone ? "cursor-default" : ""}`}
    >
      <div
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] text-white transition-colors duration-300"
        style={{
          background: isNext || isDone ? `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` : "rgba(255,255,255,0.08)",
          opacity: status === "skipped" ? 0.5 : 1,
        }}
      >
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-semibold">{item.name}</span>
          {item.optional && !isDone && <span className="rounded-full bg-white/10 px-2 py-[1px] text-[11px] font-medium text-white/60">Optional</span>}
        </div>
        {label && (
          <div className="mt-[1px] text-[13px] text-white/45">{label}</div>
        )}
      </div>
      <StatusIcon status={status} />
    </motion.button>
  );
}

function StatusIcon({ status }: { status: Status }) {
  return (
    <div className="relative h-[26px] w-[26px] shrink-0">
      <AnimatePresence initial={false} mode="popLayout">
        {status === "granted" || status === "limited" ? (
          <motion.span
            key="check"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-white"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 18 }}
          >
            <svg width="13" height="11" viewBox="0 0 12 10" fill="none" stroke="#0b0a10" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M1.5 5.2l3 3 6-6.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.1 }} />
            </svg>
          </motion.span>
        ) : status === "skipped" ? (
          <motion.span key="skip" className="absolute inset-0 flex items-center justify-center rounded-full bg-white/15" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <span className="h-[2px] w-[10px] rounded-full bg-white/70" />
          </motion.span>
        ) : status === "denied" ? (
          <motion.span
            key="denied"
            className="absolute inset-0 flex items-center justify-center rounded-full border-[1.5px] border-white/25"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        ) : (
          <motion.span key="chevron" className="absolute inset-0 flex items-center justify-center text-white/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 1.5l5 5-5 5" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Library preview inside the iOS photos prompt. */
function LibraryPeek() {
  return (
    <div className="grid grid-cols-3 gap-[3px] overflow-hidden rounded-[14px]">
      {CAMERA_ROLL.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" className="aspect-square w-full object-cover" />
      ))}
    </div>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function BellIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16z" />
      <path d="M10 20.5a2.2 2.2 0 004 0" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 8.5A2.5 2.5 0 016.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0120 8.5v8a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-8z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg {...iconProps}>
      <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z" />
    </svg>
  );
}
