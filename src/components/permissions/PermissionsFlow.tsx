"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { CAMERA_ROLL } from "@/lib/mock-data";
import { SystemAlert, type AlertSpec } from "@/components/ios/SystemAlert";
import { Aurora } from "@/components/onboarding/AccountPicker";
import { NotificationPreview, PhotosPreview, ShortcutPreview, VoicePreview } from "./Previews";
import { SHORTCUT_LABEL, ShortcutSheet, type ShortcutChoice } from "./ShortcutSheet";

type PermissionId = "notifications" | "voice" | "photos" | "shortcut";
type Status = "pending" | "granted" | "limited" | "denied" | "skipped";

type Item = {
  id: PermissionId;
  title: string;
  description: string;
  cta: string;
  icon: ReactNode;
  preview: ReactNode;
  optional?: boolean;
};

const ITEMS: Item[] = [
  {
    id: "notifications",
    title: "Notifications",
    description: "Know the moment you match, when someone messages you, and before events you've joined.",
    cta: "Allow notifications",
    icon: <BellIcon />,
    preview: <NotificationPreview />,
  },
  {
    id: "voice",
    title: "Voice",
    description: "Talk to your agent about who you are and the kind of person you're hoping to meet.",
    cta: "Allow microphone",
    icon: <MicIcon />,
    preview: <VoicePreview />,
  },
  {
    id: "photos",
    title: "Photos & camera",
    description: "Add real moments to your profile, and take a quick selfie to show it's really you.",
    cta: "Allow photos & camera",
    icon: <CameraIcon />,
    preview: <PhotosPreview />,
  },
  {
    id: "shortcut",
    title: "Voice shortcut",
    description: "Start talking to your agent from anywhere with one press, even when the app is closed.",
    cta: "Set up shortcut",
    icon: <BoltIcon />,
    preview: <ShortcutPreview />,
    optional: true,
  },
];

const APP = `“${BRAND.name}”`;

const resolved = (s: Status) => s !== "pending" && s !== "denied";

export function PermissionsFlow({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [status, setStatus] = useState<Record<PermissionId, Status>>({
    notifications: "pending",
    voice: "pending",
    photos: "pending",
    shortcut: "pending",
  });
  const [shortcut, setShortcut] = useState<ShortcutChoice | null>(null);
  const [alert, setAlert] = useState<AlertSpec | null>(null);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [shortcutRun, setShortcutRun] = useState(0);

  const done = ITEMS.filter((i) => resolved(status[i.id])).length;
  const allDone = done === ITEMS.length;
  const active = ITEMS.find((i) => !resolved(status[i.id]))?.id;

  useEffect(() => {
    if (!allDone) return;
    const t = setTimeout(onComplete, 900);
    return () => clearTimeout(t);
  }, [allDone, onComplete]);

  const set = (id: PermissionId, s: Status) => setStatus((prev) => ({ ...prev, [id]: s }));
  const answer = (id: PermissionId, s: Status) => () => {
    setAlert(null);
    set(id, s);
  };

  // Skipping is allowed, but we ask once more: these permissions carry the core experience.
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
    if (resolved(status[id])) return;
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
        setShortcutRun((n) => n + 1);
        return setShortcutOpen(true);
    }
  };

  const statusLabel = (id: PermissionId): string | null => {
    switch (status[id]) {
      case "granted":
        return id === "shortcut" && shortcut ? SHORTCUT_LABEL[shortcut] : "On";
      case "limited":
        return "On · Selected photos";
      case "skipped":
        return "Skipped · Set up later in Settings";
      case "denied":
        return "Not allowed · Tap to try again";
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="pt-safe pb-safe absolute inset-0 flex flex-col bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
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

      <div className="relative px-6 pt-5">
        <h1 className="text-[32px] font-bold leading-[38px] tracking-[-0.03em]">
          Let&apos;s set up
          <br />
          {BRAND.name}
        </h1>
        <p className="mt-2 text-[15px] leading-[21px] text-white/60">
          Tap each one to turn it on. You can change these anytime in Settings.
        </p>
        <div className="mt-4 flex items-center gap-3">
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

      <div className="no-scrollbar relative mt-5 flex-1 space-y-[10px] overflow-y-auto px-4 pb-4">
        {ITEMS.map((item) => (
          <PermissionRow
            key={item.id}
            item={item}
            status={status[item.id]}
            label={statusLabel(item.id)}
            expanded={item.id === active}
            onPress={() => request(item.id)}
            onSkip={() => set(item.id, "skipped")}
          />
        ))}
      </div>

      <SystemAlert alert={alert} />
      <ShortcutSheet
        key={shortcutRun}
        open={shortcutOpen}
        onClose={() => setShortcutOpen(false)}
        onSkip={() => {
          setShortcutOpen(false);
          set("shortcut", "skipped");
        }}
        onComplete={(choice) => {
          setShortcut(choice);
          setShortcutOpen(false);
          set("shortcut", "granted");
        }}
      />
    </motion.div>
  );
}

function PermissionRow({
  item,
  status,
  label,
  expanded,
  onPress,
  onSkip,
}: {
  item: Item;
  status: Status;
  label: string | null;
  expanded: boolean;
  onPress: () => void;
  onSkip: () => void;
}) {
  const isDone = resolved(status);
  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      aria-label={isDone ? `${item.title}: ${label}` : item.cta}
      onClick={onPress}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPress()}
      whileTap={isDone ? undefined : { scale: 0.985 }}
      className={`relative cursor-pointer overflow-hidden rounded-[24px] border outline-none ${
        expanded ? "border-white/20 bg-white/[0.08]" : "border-white/[0.08] bg-white/[0.04]"
      } ${isDone ? "cursor-default" : ""}`}
      transition={{ layout: { type: "spring", stiffness: 380, damping: 36 } }}
    >
      <motion.div layout="position" className="flex items-center gap-3 p-4">
        <div
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] text-white transition-colors duration-300"
          style={{
            background: expanded || isDone ? `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` : "rgba(255,255,255,0.08)",
            opacity: isDone && status === "skipped" ? 0.5 : 1,
          }}
        >
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold">{item.title}</span>
            {item.optional && !isDone && (
              <span className="rounded-full bg-white/10 px-2 py-[1px] text-[11px] font-medium text-white/60">Optional</span>
            )}
          </div>
          <div
            className={`mt-[1px] truncate text-[13px] ${
              status === "denied" ? "text-[#FF8AA2]" : isDone ? "text-white/55" : "text-white/45"
            }`}
          >
            {label ?? (expanded ? "Tap to allow" : item.description)}
          </div>
        </div>
        <StatusIcon status={status} />
      </motion.div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="px-4 pb-4">
              <p className="text-[15px] leading-[21px] text-white/75">{item.description}</p>
              <div className="mt-3">{item.preview}</div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="flex h-[46px] flex-1 items-center justify-center rounded-full text-[16px] font-semibold"
                  style={{ background: `linear-gradient(100deg, ${BRAND.colors.rose}, ${BRAND.colors.overlap} 55%, ${BRAND.colors.violet})` }}
                >
                  {item.cta}
                </span>
                {item.optional && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSkip();
                    }}
                    className="h-[46px] rounded-full bg-white/10 px-5 text-[16px] font-semibold text-white/80 active:opacity-60"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
            className="absolute inset-0 flex items-center justify-center rounded-full bg-[#FF3F6E]/20 text-[14px] font-bold text-[#FF8AA2]"
            initial={{ scale: 0 }}
            animate={{ scale: 1, x: [0, -4, 4, -3, 3, 0] }}
            transition={{ x: { duration: 0.4 } }}
          >
            !
          </motion.span>
        ) : (
          <motion.span key="empty" className="absolute inset-0 rounded-full border-[1.5px] border-white/25" initial={{ scale: 0.6 }} animate={{ scale: 1 }} />
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
