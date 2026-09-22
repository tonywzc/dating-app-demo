"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { summarize } from "@/lib/muse-script";
import { DEFAULT_MUSE, type Account } from "@/lib/mock-data";
import { MuseProcessing } from "./MuseProcessing";
import { MuseResult, type ProfileBasics } from "./MuseResult";
import { MuseTalk } from "./MuseTalk";
import { useConversation } from "./useConversation";

type Phase = "talk" | "processing" | "result";

/** Talk with Muse about yourself and your type, then see Muse's summary and your circle. */
export function MuseFlow({ account, profile, onDone }: { account: Account; profile: ProfileBasics; onDone: () => void }) {
  const muse = account.muse ?? DEFAULT_MUSE;
  const convo = useConversation(profile.firstName);
  const [phase, setPhase] = useState<Phase>("talk");
  const summary = useMemo(() => summarize(convo.state.answers), [convo.state.answers]);
  const snippets = convo.state.log.filter((l) => l.from === "user").map((l) => l.text);
  const showResult = useCallback(() => setPhase("result"), []);

  return (
    <div className="absolute inset-0 bg-[#0A0810]">
      <AnimatePresence>
        {phase === "talk" && <MuseTalk key="talk" muse={muse} convo={convo} onWrapUp={() => setPhase("processing")} />}
        {phase === "processing" && <MuseProcessing key="processing" muse={muse} snippets={snippets} onDone={showResult} />}
        {phase === "result" && (
          <MuseResult
            key="result"
            muse={muse}
            account={account}
            profile={profile}
            summary={summary}
            onContinue={onDone}
            onTellMore={() => setPhase("talk")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
