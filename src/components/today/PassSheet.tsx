"use client";

import { useState } from "react";
import type { Person } from "@/lib/app-data";
import type { Muse } from "@/lib/mock-data";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { Button, TextButton } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

const REASONS = ["Not my type", "Different life goals", "Too far away", "Not feeling the spark", "Something else"];

/** Passing is private, and a chance to teach Muse. */
export function PassSheet({
  open,
  person,
  muse,
  onPass,
  onClose,
}: {
  open: boolean;
  person: Person;
  muse: Muse;
  onPass: (reasons: string[]) => void;
  onClose: () => void;
}) {
  return <Sheet open={open} onClose={onClose}>{open && <Body person={person} muse={muse} onPass={onPass} onClose={onClose} />}</Sheet>;
}

function Body({ person, muse, onPass, onClose }: { person: Person; muse: Muse; onPass: (r: string[]) => void; onClose: () => void }) {
  const [reasons, setReasons] = useState<string[]>([]);
  const toggle = (r: string) => setReasons((list) => (list.includes(r) ? list.filter((x) => x !== r) : [...list, r]));

  return (
    <div className="pt-1">
      <div className="flex items-start gap-3">
        <MuseAvatar muse={muse} size={36} mood="idle" />
        <div>
          <h2 className="text-[20px] font-bold leading-[25px] tracking-[-0.02em]">Not feeling it?</h2>
          <p className="mt-1 text-[14px] leading-[20px] text-white/60">
            Tell {muse.name} why, so tomorrow&apos;s introduction fits better. {person.name} won&apos;t know.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {REASONS.map((r) => {
          const on = reasons.includes(r);
          return (
            <button
              key={r}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(r)}
              className={`rounded-full border px-4 py-[9px] text-[15px] transition-colors ${on ? "border-transparent bg-white text-black" : "border-white/15 bg-white/[0.05] text-white/85"}`}
            >
              {r}
            </button>
          );
        })}
      </div>
      <div className="mt-6">
        <Button variant="white" onClick={() => onPass(reasons)}>
          Pass on {person.name}
        </Button>
        <div className="mt-1 flex justify-center">
          <TextButton onClick={onClose} className="text-white/70">
            Keep reading
          </TextButton>
        </div>
      </div>
    </div>
  );
}
