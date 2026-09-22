"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { PRESELECTED_STORIES, TOP_STORIES, type Muse } from "@/lib/mock-data";
import type { Summary } from "@/lib/muse-script";
import type { ProfileBasics } from "@/components/muse/MuseResult";
import { ProfilePreview } from "./ProfilePreview";
import { StoriesPick, type Moment } from "./StoriesPick";
import { StoryScan } from "./StoryScan";

type Phase = "scan" | "pick" | "preview";

const initialMoments = (): Moment[] =>
  TOP_STORIES.map((s, i) => ({
    media: s,
    likes: s.likes,
    postedAt: s.postedAt,
    suggested: s.caption,
    title: s.caption,
    selected: i < PRESELECTED_STORIES,
  }));

/** After Muse: bring back the user's most-loved expired Instagram Stories as profile moments. */
export function StoriesFlow({
  muse,
  profile,
  summary,
  onDone,
}: {
  muse: Muse;
  profile: ProfileBasics;
  summary: Summary;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("scan");
  const [moments, setMoments] = useState<Moment[]>(initialMoments);
  const [skipped, setSkipped] = useState(false);
  const showPick = useCallback(() => setPhase("pick"), []);

  return (
    <div className="absolute inset-0 bg-[#0A0810]">
      <AnimatePresence>
        {phase === "scan" && <StoryScan key="scan" muse={muse} onDone={showPick} />}
        {phase === "pick" && (
          <StoriesPick
            key="pick"
            muse={muse}
            moments={moments}
            onChange={setMoments}
            onContinue={() => {
              setSkipped(false);
              setPhase("preview");
            }}
            onSkip={() => {
              setSkipped(true);
              setPhase("preview");
            }}
          />
        )}
        {phase === "preview" && (
          <ProfilePreview
            key="preview"
            muse={muse}
            profile={profile}
            summary={summary}
            moments={skipped ? [] : moments.filter((m) => m.selected)}
            onContinue={onDone}
            onEdit={() => setPhase("pick")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
