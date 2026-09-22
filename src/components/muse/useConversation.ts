"use client";

import { useEffect, useReducer } from "react";
import { BEATS, fill, type Answers, type Beat } from "@/lib/muse-script";

// Pacing (ms). User speech is simulated by typing out the scripted answer.
// Progress is computed from elapsed time, so throttled timers never slow speech down.
const MUSE_WORD_MS = 115;
const USER_CHAR_MS = 30;
const TICK_MS = 50;
const AUTO_LISTEN_MS = 450;
const PAUSE_MS = 1100;
const THINK_MS = 700;

/** `beat` is the exchange a line belongs to, so the current one can stay emphasized. */
export type Line = { id: number; from: "muse" | "user"; text: string; beat: number };

type Stage = "museSpeaking" | "waiting" | "userSpeaking" | "pause" | "thinking";

export type ConversationState = {
  beat: number;
  log: Line[];
  /** Muse lines queued for the current beat; `log`'s last line is being revealed while speaking. */
  queue: string[];
  words: number;
  /** When the current line (Muse) or answer (user) started, for elapsed-time pacing. */
  since: number;
  stage: Stage;
  chars: number;
  recording: boolean;
  answers: Answers;
  /** Reply to a quick answer, said before the next question. */
  prefix: string | null;
  /** The user stopped mid-answer; resuming moves on to the next question. */
  advancePending: boolean;
  nextId: number;
};

type Action =
  | { type: "tickWord"; now: number }
  | { type: "startUser"; now: number }
  | { type: "tickChars"; now: number }
  | { type: "pauseDone" }
  | { type: "thinkDone"; now: number }
  | { type: "toggleMic" }
  | { type: "choose"; option: string };

const wordCount = (text: string) => text.split(" ").length;

/** What the user "says" for the current beat, if anything. */
export function spokenAnswer(beat: Beat): string | undefined {
  const e = beat.expects;
  return e.type === "open" ? e.answer : e.type === "end" ? e.bonus : undefined;
}

function speak(state: ConversationState, lines: string[], now: number): ConversationState {
  const [first, ...rest] = lines;
  return {
    ...state,
    log: [...state.log, { id: state.nextId, from: "muse", text: first, beat: state.beat }],
    nextId: state.nextId + 1,
    queue: rest,
    words: 0,
    since: now,
    stage: "museSpeaking",
  };
}

function addUserLine(state: ConversationState, text: string): ConversationState {
  return {
    ...state,
    log: [...state.log, { id: state.nextId, from: "user", text, beat: state.beat }],
    nextId: state.nextId + 1,
    answers: { ...state.answers, [BEATS[state.beat].id]: text },
  };
}

function makeReducer(name: string) {
  return function reducer(state: ConversationState, action: Action): ConversationState {
    const beat = BEATS[state.beat];
    switch (action.type) {
      case "tickWord": {
        if (state.stage !== "museSpeaking") return state;
        const total = wordCount(state.log[state.log.length - 1].text);
        // One beat of silence after the last word before moving on.
        const words = Math.floor((action.now - state.since) / MUSE_WORD_MS) + 1;
        if (words <= total + 1) return words === state.words ? state : { ...state, words: Math.min(words, total) };
        if (state.queue.length) return speak(state, state.queue, action.now);
        // Done speaking. Wrapping-up beats stop listening on their own.
        return { ...state, stage: "waiting", recording: beat.expects.type === "end" ? false : state.recording };
      }
      case "startUser": {
        if (state.stage !== "waiting" || !state.recording || !spokenAnswer(beat)) return state;
        return { ...state, stage: "userSpeaking", chars: 0, since: action.now };
      }
      case "tickChars": {
        if (state.stage !== "userSpeaking") return state;
        const answer = spokenAnswer(beat)!;
        const chars = Math.floor((action.now - state.since) / USER_CHAR_MS);
        if (chars < answer.length) return chars === state.chars ? state : { ...state, chars };
        return { ...addUserLine(state, answer), stage: "pause", chars: 0 };
      }
      case "pauseDone":
        return state.stage === "pause" ? { ...state, stage: "thinking" } : state;
      case "thinkDone": {
        if (state.stage !== "thinking" || state.beat >= BEATS.length - 1) return state;
        const next = BEATS[state.beat + 1];
        const lines = [...(state.prefix ? [state.prefix] : []), ...next.muse].map((l) => fill(l, name));
        return speak({ ...state, beat: state.beat + 1, prefix: null, advancePending: false }, lines, action.now);
      }
      case "toggleMic": {
        if (state.recording) {
          if (state.stage !== "userSpeaking") return { ...state, recording: false };
          // Stopped mid-answer: keep what was said so far.
          const partial = spokenAnswer(beat)!.slice(0, state.chars).replace(/\s+\S*$/, "");
          if (partial.length < 12) return { ...state, recording: false, stage: "waiting", chars: 0 };
          return { ...addUserLine(state, `${partial}…`), recording: false, stage: "waiting", chars: 0, advancePending: true };
        }
        if (state.advancePending && state.stage === "waiting") return { ...state, recording: true, stage: "thinking" };
        return { ...state, recording: true };
      }
      case "choose": {
        if (state.stage !== "waiting" || beat.expects.type !== "quick") return state;
        return { ...addUserLine(state, action.option), prefix: beat.expects.replies[action.option] ?? null, stage: "thinking" };
      }
    }
  };
}

function initialState(name: string): ConversationState {
  const base: ConversationState = {
    beat: 0,
    log: [],
    queue: [],
    words: 0,
    since: 0,
    stage: "museSpeaking",
    chars: 0,
    recording: false,
    answers: {},
    prefix: null,
    advancePending: false,
    nextId: 1,
  };
  return speak(base, BEATS[0].muse.map((l) => fill(l, name)), Date.now());
}

export function useConversation(name: string) {
  const [state, dispatch] = useReducer(makeReducer(name), name, initialState);
  const beat = BEATS[state.beat];

  // Drive the conversation forward. Speaking stages tick on an interval (progress is
  // time-based); the others wait once and hand off.
  const { stage, recording, advancePending } = state;
  useEffect(() => {
    const at = (action: (now: number) => Action) => () => dispatch(action(Date.now()));
    if (stage === "museSpeaking" || stage === "userSpeaking") {
      const tick = at((now) => ({ type: stage === "museSpeaking" ? "tickWord" : "tickChars", now }));
      const t = setInterval(tick, TICK_MS);
      return () => clearInterval(t);
    }
    let t: ReturnType<typeof setTimeout> | undefined;
    if (stage === "waiting" && recording && !advancePending && spokenAnswer(beat)) t = setTimeout(at((now) => ({ type: "startUser", now })), AUTO_LISTEN_MS);
    if (stage === "pause") t = setTimeout(at(() => ({ type: "pauseDone" })), PAUSE_MS);
    if (stage === "thinking") t = setTimeout(at((now) => ({ type: "thinkDone", now })), THINK_MS);
    return () => clearTimeout(t);
  }, [stage, recording, advancePending, beat]);

  const answered = Object.keys(state.answers).length;
  const exhausted = beat.expects.type === "end" && !beat.expects.bonus;
  const quick = beat.expects.type === "quick" && state.stage === "waiting" ? beat.expects.options : null;

  return {
    state,
    beat,
    /** Live caption of what the user is saying right now. */
    partial: state.stage === "userSpeaking" ? spokenAnswer(beat)!.slice(0, state.chars) : "",
    quickOptions: quick,
    /** Show "That's me, for now". */
    canWrapUp: !state.recording && answered > 0 && state.stage === "waiting" && !quick,
    exhausted,
    toggleMic: () => dispatch({ type: "toggleMic" }),
    choose: (option: string) => dispatch({ type: "choose", option }),
  };
}
