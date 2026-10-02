"use client";

import { useState } from "react";
import type { Person } from "@/lib/app-data";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Sheet } from "@/components/ui/Sheet";
import { BookIcon, ChatBubbleIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { SERIF } from "@/components/today/ProfileBook";
import { StatusPill } from "./PersonPeek";

/** The Nearby profile: short, with one tap to start a chat. */
export function PersonSheet({
  person,
  chatting,
  onSayHi,
  onFullProfile,
  onClose,
}: {
  person: Person | null;
  chatting: boolean;
  /** Starts (or opens) the chat. */
  onSayHi: () => void;
  onFullProfile: () => void;
  onClose: () => void;
}) {
  // Keep the last person while the sheet animates closed.
  const [shown, setShown] = useState(person);
  if (person && person !== shown) setShown(person);
  const p = shown;

  return (
    <Sheet open={person !== null} onClose={onClose}>
      {p && (
        <div className="pt-1">
          <div className="relative h-[300px] overflow-hidden rounded-[26px]">
            <Photo src={p.photo} alt={p.name} initial={p.name[0]} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <StatusPill person={p} className="absolute left-3 top-3" />
            <div className="absolute inset-x-4 bottom-3">
              <div className="flex items-center gap-[6px] text-[28px] font-bold tracking-[-0.02em]">
                {p.name}
                <span className="font-light text-white/85">{p.age}</span>
                {p.verified && <ShieldCheckIcon size={18} />}
              </div>
              <div className="text-[15px] text-white/70">{p.neighborhood}</div>
            </div>
          </div>
          <p className="mt-4 px-1 text-[19px] leading-[27px]" style={SERIF}>
            &ldquo;{p.nearby?.line}&rdquo;
          </p>
          <div className="mt-5 grid grid-cols-[56px_1fr] gap-3">
            <button
              type="button"
              aria-label="Full story"
              onClick={onFullProfile}
              className="flex h-[54px] w-[56px] items-center justify-center rounded-full bg-white/10 active:bg-white/20"
            >
              <BookIcon size={22} />
            </button>
            <Button onClick={onSayHi}>
              <span className="flex items-center justify-center gap-2">
                <ChatBubbleIcon size={17} />
                {chatting ? "Open chat" : "Say hi"}
              </span>
            </Button>
          </div>
          <div className="h-2" />
        </div>
      )}
    </Sheet>
  );
}
