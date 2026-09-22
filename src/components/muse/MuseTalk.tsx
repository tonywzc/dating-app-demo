"use client";

import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Muse } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { IntimateBackdrop, type BackdropMode } from "./IntimateBackdrop";
import { MuseAvatar, type MuseMood } from "./MuseAvatar";
import type { Line, useConversation } from "./useConversation";

type Conversation = ReturnType<typeof useConversation>;

export const WRAP_UP_LABEL = "That's me, for now";

export function MuseTalk({ muse, convo, onWrapUp }: { muse: Muse; convo: Conversation; onWrapUp: () => void }) {
  const { state, partial, quickOptions, canWrapUp, exhausted } = convo;
  const { stage, recording } = state;

  const mood: MuseMood =
    stage === "museSpeaking"
      ? "speaking"
      : stage === "thinking"
        ? "thinking"
        : recording || stage === "pause"
          ? "listening"
          : "idle";
  const backdrop: BackdropMode = stage === "userSpeaking" ? "voice" : recording ? "listening" : stage === "museSpeaking" ? "speaking" : "calm";
  const status =
    stage === "museSpeaking" ? "Speaking" : stage === "thinking" ? "Thinking" : recording || stage === "pause" ? "Listening" : "Here with you";

  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
      <IntimateBackdrop mode={backdrop} />

      <div className="pt-safe pb-safe relative flex h-full flex-col">
        {/* Muse */}
        <div className="flex flex-col items-center pt-8">
          <MuseAvatar muse={muse} size={128} mood={mood} pulse={state.words} />
          <div className="mt-5 text-[17px] font-semibold">{muse.name}</div>
          <div className="mt-[2px] flex h-[18px] items-center gap-[6px] text-[13px] text-white/55">
            {(recording || stage === "pause") && (
              <motion.span className="h-[6px] w-[6px] rounded-full bg-[#FF6A88]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            )}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={status} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.2 }}>
                {status}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <Transcript log={state.log} beat={state.beat} revealing={stage === "museSpeaking"} words={state.words} partial={partial} />

        <Controls
          muse={muse}
          convo={convo}
          quickOptions={quickOptions}
          canWrapUp={canWrapUp}
          exhausted={exhausted}
          onWrapUp={onWrapUp}
        />
      </div>
    </motion.div>
  );
}

/** Captions that drift up and fade, so the animation is never fully covered. */
function Transcript({
  log,
  beat,
  revealing,
  words,
  partial,
}: {
  log: Line[];
  beat: number;
  revealing: boolean;
  words: number;
  partial: string;
}) {
  const visible = log.slice(-5);
  // Muse lines of the current exchange stay bright; the rest recede.
  const emphasisOf = (line: Line) => (line.beat === beat ? (line.from === "muse" ? 1 : 0.75) : line.beat === beat - 1 && line.from === "user" ? 0.55 : 0.28);

  return (
    <div
      className="relative flex flex-1 flex-col justify-end overflow-hidden px-7 pb-4"
      style={{ maskImage: "linear-gradient(to bottom, transparent 0%, #000 38%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 38%)" }}
    >
      <AnimatePresence initial={false}>
        {visible.map((line, i) => {
          const isRevealing = revealing && i === visible.length - 1 && line.from === "muse";
          const emphasis = emphasisOf(line);
          return (
            <motion.div
              key={line.id}
              layout="position"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: emphasis, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              className={line.from === "muse" ? "mt-4" : "mt-3"}
            >
              {line.from === "muse" ? (
                <p className="text-[21px] font-medium leading-[29px] tracking-[-0.01em] text-white">
                  {isRevealing ? <RevealWords text={line.text} count={words} /> : line.text}
                </p>
              ) : (
                <UserLine text={line.text} />
              )}
            </motion.div>
          );
        })}
        {partial && (
          <motion.div key="partial" layout="position" className="mt-3" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}>
            <UserLine text={partial} live />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserLine({ text, live = false }: { text: string; live?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="mt-[5px] w-[2px] shrink-0 self-stretch rounded-full" style={{ background: `linear-gradient(${BRAND.colors.rose}, ${BRAND.colors.violet})` }} />
      <p className="text-[16px] leading-[23px] text-white">
        {text}
        {live && <motion.span className="ml-[2px] inline-block h-[15px] w-[2px] translate-y-[2px] bg-white/70" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />}
      </p>
    </div>
  );
}

function RevealWords({ text, count }: { text: string; count: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={i < count ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.35 }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </>
  );
}

function Controls({
  muse,
  convo,
  quickOptions,
  canWrapUp,
  exhausted,
  onWrapUp,
}: {
  muse: Muse;
  convo: Conversation;
  quickOptions: string[] | null;
  canWrapUp: boolean;
  exhausted: boolean;
  onWrapUp: () => void;
}) {
  const { recording } = convo.state;
  const hasAnswers = Object.keys(convo.state.answers).length > 0;
  const mode = quickOptions ? "quick" : canWrapUp ? "wrap" : "mic";

  return (
    <div className="relative min-h-[196px] px-5 pb-3">
      <AnimatePresence mode="wait" initial={false}>
        {mode === "quick" && (
          <motion.div key="quick" className="space-y-2" exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}>
            {quickOptions!.map((option, i) => (
              <motion.button
                key={option}
                type="button"
                onClick={() => convo.choose(option)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 380, damping: 30 }}
                whileTap={{ scale: 0.97 }}
                className="flex h-[52px] w-full items-center justify-center rounded-full border border-white/20 bg-white/[0.1] text-[17px] font-medium backdrop-blur-xl active:bg-white/20"
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )}

        {mode === "wrap" && (
          <motion.div
            key="wrap"
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <Button onClick={onWrapUp}>{WRAP_UP_LABEL}</Button>
            <p className="mt-2 text-[13px] text-white/50">You can always tell {muse.name} more later.</p>
            {!exhausted && (
              <div className="mt-4 flex items-center gap-3">
                <MicButton size={52} recording={false} speaking={false} onPress={convo.toggleMic} />
                <span className="text-[15px] font-medium text-white/75">Keep talking</span>
              </div>
            )}
          </motion.div>
        )}

        {mode === "mic" && (
          <motion.div
            key="mic"
            className="flex flex-col items-center pt-8"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
          >
            <MicButton size={80} recording={recording} speaking={convo.state.stage === "userSpeaking"} invite={!hasAnswers && !recording} onPress={convo.toggleMic} />
            <span className="mt-3 text-[13px] font-medium text-white/60">
              {recording ? "Listening · tap when you're done" : hasAnswers ? "Tap to keep talking" : "Tap to start talking"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MicButton({
  size,
  recording,
  speaking,
  invite = false,
  onPress,
}: {
  size: number;
  recording: boolean;
  speaking: boolean;
  invite?: boolean;
  onPress: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={recording ? "Stop talking" : "Start talking"}
      aria-pressed={recording}
      onClick={onPress}
      whileTap={{ scale: 0.92 }}
      className="relative flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Live level ring */}
      {recording && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,140,150,0.45), transparent)" }}
          animate={{ scale: speaking ? [1.15, 1.45, 1.2, 1.5, 1.15] : [1.1, 1.25, 1.1] }}
          transition={{ duration: speaking ? 1.1 : 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {invite && (
        <motion.span
          className="absolute inset-0 rounded-full border border-white/40"
          animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.span
        className="absolute inset-0 rounded-full border"
        animate={{
          background: recording
            ? `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})`
            : "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))",
          borderColor: recording ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.22)",
        }}
        transition={{ duration: 0.3 }}
        style={{ backdropFilter: "blur(20px)" }}
      />
      <AnimatePresence mode="wait" initial={false}>
        {recording ? (
          <motion.span key="stop" className="relative rounded-[6px] bg-white" style={{ width: size * 0.26, height: size * 0.26 }} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />
        ) : (
          <motion.svg key="mic" className="relative" width={size * 0.38} height={size * 0.38} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="#fff" stroke="none" />
            <path d="M5 11a7 7 0 0014 0M12 18v3.5" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
