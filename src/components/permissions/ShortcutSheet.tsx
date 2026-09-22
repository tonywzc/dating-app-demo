"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { capturePointer } from "@/lib/pointer";
import { BrandMark } from "@/components/brand/BrandMark";
import { useActionButton } from "@/components/device/ActionButtonContext";
import { Button, TextButton } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { ActionButtonArt, MicGlyph, Waveform } from "./Previews";

export type ShortcutChoice = "action" | "backtap" | "heart";

const CHOICES: { id: ShortcutChoice; title: string; detail: string; gesture: "hold" | "doubletap"; badge?: string }[] = [
  {
    id: "action",
    title: "Action Button",
    detail: "Press and hold the button on the side of your iPhone. Works even when the app is closed.",
    gesture: "hold",
    badge: "Recommended",
  },
  {
    id: "backtap",
    title: "Back Tap",
    detail: "Double-tap the back of your iPhone to start, and stop talking to finish.",
    gesture: "doubletap",
  },
  {
    id: "heart",
    title: "Hold the heart",
    detail: `Press and hold the heart in ${BRAND.name}'s tab bar. Works in the app on any iPhone.`,
    gesture: "hold",
  },
];

export const SHORTCUT_LABEL: Record<ShortcutChoice, string> = {
  action: "Action Button",
  backtap: "Back Tap",
  heart: "Hold the heart",
};

const TRANSCRIPT = "I'm looking for someone who loves weekend hikes and good coffee.";
const MIN_HOLD_MS = 900;

type Step = "choose" | "try" | "done";
type TryState = "idle" | "listening" | "tooShort";

export function ShortcutSheet({
  open,
  onClose,
  onComplete,
  onSkip,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (choice: ShortcutChoice) => void;
  onSkip: () => void;
}) {
  const [choice, setChoice] = useState<ShortcutChoice>("action");
  const [step, setStep] = useState<Step>("choose");
  const selected = CHOICES.find((c) => c.id === choice)!;

  return (
    <Sheet open={open} onClose={onClose}>
      <AnimatePresence mode="wait" initial={false}>
        {step === "choose" && (
          <Panel key="choose">
            <h2 className="text-center text-[24px] font-bold tracking-[-0.02em]">Talk to your agent, anywhere</h2>
            <p className="mx-auto mt-1 max-w-[320px] text-center text-[15px] leading-[21px] text-white/60">
              Pick a shortcut. Whenever something comes to mind about you or your ideal partner, just say it.
            </p>
            <div className="mt-5 space-y-2">
              {CHOICES.map((c) => (
                <ChoiceCard key={c.id} selected={c.id === choice} onSelect={() => setChoice(c.id)} art={<ChoiceArt id={c.id} />} {...c} />
              ))}
            </div>
            <div className="mt-5">
              <Button onClick={() => setStep("try")}>Use {selected.title}</Button>
              <div className="mt-1 flex justify-center">
                <TextButton onClick={onSkip} className="text-white/70">
                  Skip for now
                </TextButton>
              </div>
            </div>
          </Panel>
        )}
        {step === "try" && (
          <Panel key="try">
            <TryIt choice={selected} onBack={() => setStep("choose")} onSuccess={() => setStep("done")} />
          </Panel>
        )}
        {step === "done" && (
          <Panel key="done">
            <div className="flex flex-col items-center pt-4 text-center">
              <motion.div
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
                style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <svg width="30" height="24" viewBox="0 0 12 10" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5.2l3 3 6-6.4" />
                </svg>
              </motion.div>
              <h2 className="mt-4 text-[24px] font-bold tracking-[-0.02em]">Your shortcut is ready</h2>
              <p className="mt-1 max-w-[300px] text-[15px] leading-[21px] text-white/60">
                {selected.gesture === "hold" ? "Hold" : "Double-tap"} with {selected.title} any time. Change it later in Settings.
              </p>
            </div>
            <div className="mt-6">
              <Button onClick={() => onComplete(choice)}>Done</Button>
            </div>
          </Panel>
        )}
      </AnimatePresence>
    </Sheet>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.div>
  );
}

function ChoiceCard({
  title,
  detail,
  badge,
  selected,
  onSelect,
  art,
}: {
  title: string;
  detail: string;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
  art: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-center gap-3 rounded-[20px] border p-3 text-left transition-colors ${
        selected ? "border-white/60 bg-white/[0.1]" : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex h-[56px] w-[48px] shrink-0 items-center justify-center">{art}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-semibold">{title}</span>
          {badge && (
            <span
              className="rounded-full px-2 py-[2px] text-[11px] font-semibold"
              style={{ background: `linear-gradient(100deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="mt-[2px] text-[13px] leading-[17px] text-white/55">{detail}</p>
      </div>
      <span
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          selected ? "border-white bg-white" : "border-white/30"
        }`}
      >
        {selected && <span className="h-[8px] w-[8px] rounded-full bg-ink" />}
      </span>
    </motion.button>
  );
}

function ChoiceArt({ id }: { id: ShortcutChoice }) {
  if (id === "action") return <ActionButtonArt size={0.78} />;
  if (id === "backtap") {
    return (
      <div className="relative h-[54px] w-[32px] rounded-[9px] border-2 border-white/35">
        <div className="absolute left-[5px] top-[5px] h-[14px] w-[14px] rounded-[5px] bg-white/25" />
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80"
            animate={{ scale: [0.4, 1.6], opacity: [0.9, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.2, delay: i * 0.22 }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="relative flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/10">
      <motion.div animate={{ scale: [1, 0.86, 0.86, 1] }} transition={{ duration: 1.8, times: [0, 0.2, 0.75, 1], repeat: Infinity }}>
        <BrandMark width={22} />
      </motion.div>
    </div>
  );
}

/** Practice the gesture. Holding works with the pill below, or the device frame's real Action Button. */
function TryIt({
  choice,
  onBack,
  onSuccess,
}: {
  choice: (typeof CHOICES)[number];
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [state, setState] = useState<TryState>("idle");
  const [typed, setTyped] = useState(0);
  const holdStart = useRef(0);
  const { setHint, subscribe } = useActionButton();

  // Pulse the frame's Action Button while practicing it.
  useEffect(() => {
    setHint(choice.id === "action");
    return () => setHint(false);
  }, [choice.id, setHint]);

  // Type out the transcript while listening.
  useEffect(() => {
    if (state !== "listening") return;
    const t = setInterval(() => setTyped((n) => Math.min(n + 1, TRANSCRIPT.length)), 38);
    return () => clearInterval(t);
  }, [state]);

  const start = () => {
    holdStart.current = Date.now();
    setTyped(0);
    setState("listening");
  };
  const release = () => {
    if (state !== "listening") return;
    if (Date.now() - holdStart.current < MIN_HOLD_MS) setState("tooShort");
    else onSuccess();
  };

  // Mirror the frame's Action Button (only while practicing it).
  const handlers = useRef({ start, release });
  useEffect(() => {
    handlers.current = { start, release };
  });
  useEffect(() => {
    if (choice.id !== "action") return;
    return subscribe((down) => (down ? handlers.current.start() : handlers.current.release()));
  }, [choice.id, subscribe]);

  // Back Tap: a double-tap starts listening; it ends on its own after a pause.
  useEffect(() => {
    if (choice.gesture !== "doubletap" || state !== "listening") return;
    const t = setTimeout(onSuccess, 2600);
    return () => clearTimeout(t);
  }, [choice.gesture, state, onSuccess]);

  const listening = state === "listening";
  const instruction =
    choice.id === "action"
      ? "Press and hold the Action Button on the left side of the phone, or the button below, and say something."
      : choice.id === "backtap"
        ? "Double-tap below, like tapping the back of your iPhone, then say something."
        : "Press and hold the heart below and say something.";

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <button type="button" onClick={onBack} className="w-[60px] text-left text-[17px] text-white/70 active:opacity-50">
          Back
        </button>
        <h2 className="text-[17px] font-semibold">Try it</h2>
        <span className="w-[60px]" />
      </div>
      <p className="mx-auto mt-1 max-w-[320px] text-center text-[15px] leading-[21px] text-white/65">{instruction}</p>

      <div className="mt-5 flex h-[92px] flex-col items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.04] px-4">
        {listening ? (
          <>
            <Waveform bars={34} height={26} />
            <p className="mt-2 min-h-[20px] text-center text-[14px] text-white/85">
              {TRANSCRIPT.slice(0, typed)}
              <span className="animate-pulse text-white/40">|</span>
            </p>
          </>
        ) : (
          <p className={`text-center text-[14px] ${state === "tooShort" ? "text-[#FF8AA2]" : "text-white/45"}`}>
            {state === "tooShort" ? "Keep holding while you talk, then let go." : "Your agent is ready when you are."}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center">
        <motion.button
          type="button"
          aria-label={choice.gesture === "hold" ? "Hold to talk" : "Double-tap to talk"}
          className="relative flex h-[84px] w-[84px] touch-none select-none items-center justify-center rounded-full"
          style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
          animate={{ scale: listening ? 1.12 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          {...(choice.gesture === "hold"
            ? {
                onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
                  capturePointer(e);
                  start();
                },
                onPointerUp: release,
                onPointerCancel: release,
              }
            : { onDoubleClick: () => !listening && start() })}
        >
          {listening && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-white/60"
              animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          )}
          {choice.id === "heart" ? <BrandMark width={40} tone="white" /> : <MicGlyph size={32} />}
        </motion.button>
        <span className="mt-3 text-[13px] font-medium text-white/50">
          {listening
            ? choice.gesture === "hold"
              ? "Listening. Let go when you're done"
              : "Listening…"
            : choice.gesture === "hold"
              ? "Hold to talk"
              : "Double-tap to talk"}
        </span>
      </div>
      <div className="h-4" />
    </div>
  );
}
